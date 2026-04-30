// ═══════════════════════════════════════════════════════════
// EPGB Send Panel — מודול שליחה אחיד
// גרסה 1.0 | מוזרק לכל דף: customers, admin (חי), staff
// ═══════════════════════════════════════════════════════════
// שימוש:
//   <script src="send-panel.js"></script>
//   EPGBSendPanel.open({ recipients, context, staffRole })
//
// recipients = מערך אובייקטים: [{ id, name, phone, gender, ticket_type, redeemed_at, arrived_at }]
// context    = 'customers' | 'live' | 'staff'
// staffRole  = 'admin' | 'bar_manager' | 'pr' | 'cashier'
// ═══════════════════════════════════════════════════════════

window.EPGBSendPanel = (() => {

  const SUPABASE_URL      = 'https://qdgedsxhlcmgtrkxaxsu.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZ2Vkc3hobGNtZ3Rya3hheHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTkxMTksImV4cCI6MjA5MTI5NTExOX0.RlXd13uq8tdq2ca4WpNOyfY4_tkPvgi0_bsqYFtFvl4';
  const HDRS = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' };

  // ── הרשאות לפי תפקיד ──
  const ROLE_PERMISSIONS = {
    admin:       { wa: true, gift: true, ticket: true, invite: true },
    bar_manager: { wa: true, gift: true, ticket: false, invite: true },
    pr:          { wa: true, gift: false, ticket: true, invite: true },
    cashier:     { wa: true, gift: false, ticket: false, invite: false },
  };

  // ── State ──
  let state = {
    allRecipients: [],
    filtered: [],
    selected: new Set(),
    sentIds: new Set(),   // מי כבר קיבל שליחה בסשן זה
    events: [],
    context: 'customers',
    staffRole: 'admin',
    activeTab: 'wa',
    giftType: 'drink',
    giftQty: 1,
    discount: 100,
    sendLimit: 0,         // 0 = הכל
    filters: { gender: '', ticketType: '', redeemed: '', arrivedIn: '' },
  };

  // ── CSS ──
  function injectCSS() {
    if (document.getElementById('epgb-send-panel-css')) return;
    const style = document.createElement('style');
    style.id = 'epgb-send-panel-css';
    style.textContent = `
      #epgbSendOverlay {
        position: fixed; inset: 0; z-index: 10000;
        background: rgba(0,0,0,0.88);
        display: flex; align-items: flex-start; justify-content: center;
        padding: 1rem; overflow-y: auto;
        animation: spFadeIn 0.2s ease;
      }
      @keyframes spFadeIn { from{opacity:0} to{opacity:1} }

      #epgbSendPanel {
        background: #0a0806;
        border: 1px solid #2a2520;
        border-top: 3px solid #c41a1a;
        width: 100%; max-width: 560px;
        margin: auto;
        font-family: 'Frank Ruhl Libre', serif;
        animation: spSlideUp 0.25s ease;
      }
      @keyframes spSlideUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }

      .sp-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 1rem 1.2rem;
        border-bottom: 1px solid #1a1512;
        background: rgba(196,26,26,0.06);
      }
      .sp-title {
        font-family: 'Bebas Neue', cursive;
        font-size: 1.4rem; letter-spacing: 0.1em; color: #d8d0c0;
      }
      .sp-close {
        background: none; border: none; color: #a09888;
        font-size: 1.4rem; cursor: pointer; padding: 0.2rem 0.5rem;
        transition: color 0.2s;
      }
      .sp-close:hover { color: #c41a1a; }

      /* ── RECIPIENTS BAR ── */
      .sp-recipients {
        padding: 0.8rem 1.2rem;
        border-bottom: 1px solid #1a1512;
        background: rgba(255,255,255,0.02);
      }
      .sp-recipients-title {
        font-family: 'Special Elite', cursive;
        font-size: 0.7rem; letter-spacing: 0.15em;
        color: #c41a1a; margin-bottom: 0.5rem;
      }
      .sp-filters-row {
        display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.6rem;
      }
      .sp-filter-select {
        background: rgba(255,255,255,0.04);
        border: 1px solid #2a2520; color: #d8d0c0;
        font-family: 'Special Elite', cursive; font-size: 0.7rem;
        padding: 0.3rem 0.5rem; cursor: pointer;
      }
      .sp-filter-select:focus { outline: none; border-color: #c41a1a; }

      .sp-recipient-count {
        display: flex; align-items: center; justify-content: space-between;
      }
      .sp-count-num {
        font-family: 'Bebas Neue', cursive;
        font-size: 1.5rem; color: #c41a1a;
      }
      .sp-count-label {
        font-family: 'Special Elite', cursive;
        font-size: 0.7rem; color: #a09888;
      }
      .sp-select-all {
        background: transparent; border: 1px dashed #2a2520;
        color: #a09888; font-family: 'Special Elite', cursive;
        font-size: 0.7rem; padding: 0.3rem 0.7rem; cursor: pointer;
        transition: all 0.2s;
      }
      .sp-select-all:hover { border-color: #c41a1a; color: #d8d0c0; }
      .sp-select-all.all-selected { border-color: #c41a1a; color: #c41a1a; }

      /* ── TABS ── */
      .sp-tabs {
        display: flex; border-bottom: 1px solid #1a1512;
      }
      .sp-tab {
        flex: 1; padding: 0.8rem 0.5rem; text-align: center;
        background: none; border: none; border-bottom: 2px solid transparent;
        font-family: 'Bebas Neue', cursive; font-size: 0.95rem;
        letter-spacing: 0.08em; color: #a09888; cursor: pointer;
        transition: all 0.2s;
      }
      .sp-tab:hover { color: #d8d0c0; }
      .sp-tab.active { color: #d8d0c0; border-bottom-color: #c41a1a; }
      .sp-tab:disabled { opacity: 0.3; cursor: not-allowed; }
      .sp-tab-icon { font-size: 1rem; display: block; margin-bottom: 0.1rem; }

      /* ── CONTENT ── */
      .sp-content { padding: 1.2rem; }
      .sp-section { display: none; }
      .sp-section.active { display: block; animation: spFadeIn 0.2s ease; }

      .sp-label {
        display: block; font-family: 'Special Elite', cursive;
        font-size: 0.68rem; letter-spacing: 0.18em;
        color: #c41a1a; margin-bottom: 0.4rem; text-transform: uppercase;
      }
      .sp-input, .sp-textarea, .sp-select {
        width: 100%; background: rgba(255,255,255,0.04);
        border: 1px solid #2a2520; border-bottom: 2px solid #a09888;
        color: #d8d0c0; font-family: 'Special Elite', cursive;
        font-size: 0.9rem; padding: 0.6rem 0.8rem; outline: none;
        transition: border-color 0.2s; resize: vertical;
      }
      .sp-input:focus, .sp-textarea:focus, .sp-select:focus {
        border-color: #c41a1a; background: rgba(196,26,26,0.05);
      }
      .sp-textarea { min-height: 80px; }

      .sp-btn-group {
        display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.8rem;
      }
      .sp-btn-opt {
        padding: 0.4rem 0.9rem;
        border: 1px solid #2a2520; background: transparent;
        color: #a09888; font-family: 'Special Elite', cursive;
        font-size: 0.75rem; cursor: pointer; transition: all 0.2s;
      }
      .sp-btn-opt:hover { border-color: #c41a1a; color: #d8d0c0; }
      .sp-btn-opt.active { border-color: #c41a1a; background: rgba(196,26,26,0.15); color: #d8d0c0; }

      .sp-preview {
        background: rgba(255,255,255,0.03); border: 1px solid #1a1512;
        padding: 0.7rem; font-family: 'Special Elite', cursive;
        font-size: 0.78rem; color: #a09888; white-space: pre-wrap;
        line-height: 1.6; min-height: 2.5rem; margin-top: 0.6rem;
        border-right: 2px solid #c41a1a;
      }
      .sp-preview-label {
        font-family: 'Special Elite', cursive; font-size: 0.6rem;
        color: #666; letter-spacing: 0.1em; margin-bottom: 0.3rem;
      }

      .sp-form-group { margin-bottom: 0.9rem; }

      .sp-send-btn {
        width: 100%; padding: 1rem; background: #c41a1a;
        border: none; color: #d8d0c0;
        font-family: 'Bebas Neue', cursive;
        font-size: 1.3rem; letter-spacing: 0.2em;
        cursor: pointer; transition: all 0.2s;
        position: relative; overflow: hidden; margin-top: 0.8rem;
      }
      .sp-send-btn:hover { background: #e02020; box-shadow: 0 0 20px rgba(196,26,26,0.4); }
      .sp-send-btn:disabled { background: #2a2520; cursor: not-allowed; }

      .sp-warning {
        font-family: 'Special Elite', cursive; font-size: 0.7rem;
        color: #c4a01a; padding: 0.5rem 0.8rem;
        border: 1px solid rgba(196,160,26,0.3);
        background: rgba(196,160,26,0.06); margin-top: 0.6rem;
      }
      .sp-spinner {
        display: inline-block; width: 12px; height: 12px;
        border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
        border-radius: 50%; animation: spSpin 0.7s linear infinite;
        margin-left: 0.4rem; vertical-align: middle;
      }
      @keyframes spSpin { to { transform: rotate(360deg); } }

      .sp-progress {
        padding: 1rem 1.2rem; border-top: 1px solid #1a1512;
        display: none;
      }
      .sp-progress.active { display: block; }
      .sp-progress-bar-wrap {
        background: #1a1512; height: 4px; margin: 0.5rem 0;
      }
      .sp-progress-bar {
        height: 100%; background: #c41a1a; transition: width 0.3s;
      }
      .sp-progress-text {
        font-family: 'Special Elite', cursive; font-size: 0.72rem; color: #a09888;
      }

      .sp-toast {
        position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
        background: #1a3a1a; border: 1px solid #2a5a2a; color: #7ec87e;
        font-family: 'Special Elite', cursive; font-size: 0.8rem;
        padding: 0.6rem 1.2rem; z-index: 10001; opacity: 0;
        transition: opacity 0.3s; pointer-events: none;
      }
      .sp-toast.show { opacity: 1; }
      .sp-toast.error { background: #3a1a1a; border-color: #5a2a2a; color: #e07070; }

      .sp-no-perm {
        text-align: center; padding: 1.5rem;
        font-family: 'Special Elite', cursive; font-size: 0.8rem; color: #666;
      }
    `;
    document.head.appendChild(style);
  }

  // ── HTML ──
  function buildHTML() {
    const perms = ROLE_PERMISSIONS[state.staffRole] || ROLE_PERMISSIONS.admin;

    return `
    <div id="epgbSendOverlay" onclick="EPGBSendPanel._overlayClick(event)">
      <div id="epgbSendPanel">

        <!-- HEADER -->
        <div class="sp-header">
          <div class="sp-title">📤 שליחה מהירה</div>
          <button class="sp-close" onclick="EPGBSendPanel.close()">✕</button>
        </div>

        <!-- RECIPIENTS -->
        <div class="sp-recipients">
          <div class="sp-recipients-title">▸ למי לשלוח</div>

          <div class="sp-filters-row">
            <select class="sp-filter-select" id="spFGender" onchange="EPGBSendPanel._applyFilters()">
              <option value="">כל מגדר</option>
              <option value="M">אדונים</option>
              <option value="F">גברות</option>
            </select>
            <select class="sp-filter-select" id="spFTicket" onchange="EPGBSendPanel._applyFilters()">
              <option value="">כל כרטיס</option>
              <option value="BASIC">Basic ₪50</option>
              <option value="STANDARD">Standard ₪100</option>
              <option value="PREMIUM">Premium ₪150</option>
            </select>
            <select class="sp-filter-select" id="spFRedeemed" onchange="EPGBSendPanel._applyFilters()">
              <option value="">הכל</option>
              <option value="yes">נכנסו ✓</option>
              <option value="no">לא הגיעו</option>
            </select>
            <select class="sp-filter-select" id="spFArrived" onchange="EPGBSendPanel._applyFilters()">
              <option value="">כל זמן הגעה</option>
              <option value="30">הגיעו ב-30 דק׳</option>
              <option value="60">הגיעו ב-60 דק׳</option>
              <option value="120">הגיעו ב-2 שע׳</option>
              <option value="first20">20 ראשונים</option>
              <option value="last20">20 אחרונים</option>
            </select>
            <select class="sp-filter-select" id="spFVip" onchange="EPGBSendPanel._applyFilters()">
              <option value="">כולם</option>
              <option value="vip">VIP בלבד</option>
              <option value="member">חברי מועדון</option>
            </select>
          </div>

          <div class="sp-recipient-count">
            <div>
              <span class="sp-count-num" id="spFilteredCount">0</span>
              <span class="sp-count-label"> מסוננים · </span>
              <span class="sp-count-num" id="spSelectedCount" style="color:#d8d0c0">0</span>
              <span class="sp-count-label"> נבחרו</span>
              <span id="spSentBadge" style="display:none;margin-right:0.5rem;font-family:'Special Elite',cursive;font-size:0.65rem;color:#7ec87e;background:rgba(42,90,42,0.3);padding:0.1rem 0.4rem;border:1px solid #2a5a2a">
                <span id="spSentCount">0</span> נשלח
              </span>
            </div>
            <button class="sp-select-all" id="spSelectAllBtn" onclick="EPGBSendPanel._toggleSelectAll()">
              ☐ בחר הכל
            </button>
          </div>

          <!-- לימיט + שלח לשאר -->
          <div style="display:flex;gap:0.5rem;align-items:center;margin-top:0.5rem;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:0.4rem">
              <span style="font-family:'Special Elite',cursive;font-size:0.65rem;color:#a09888">מקסימום:</span>
              <select class="sp-filter-select" id="spLimitSel" onchange="EPGBSendPanel._setLimit(this.value)" style="font-size:0.65rem;padding:0.2rem 0.4rem">
                <option value="0">הכל</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </div>
            <button id="spSendRestBtn" onclick="EPGBSendPanel._selectRest()" style="display:none;background:transparent;border:1px solid #2a5a2a;color:#7ec87e;font-family:'Special Elite',cursive;font-size:0.65rem;padding:0.2rem 0.6rem;cursor:pointer">
              ↩ בחר את השאר (<span id="spRestCount">0</span>)
            </button>
          </div>
        </div>

        <!-- TABS -->
        <div class="sp-tabs">
          <button class="sp-tab active" id="spTabWa" onclick="EPGBSendPanel._setTab('wa')" ${!perms.wa ? 'disabled' : ''}>
            <span class="sp-tab-icon">💬</span>הודעה
          </button>
          <button class="sp-tab" id="spTabGift" onclick="EPGBSendPanel._setTab('gift')" ${!perms.gift ? 'disabled' : ''}>
            <span class="sp-tab-icon">🎁</span>פינוק
          </button>
          <button class="sp-tab" id="spTabTicket" onclick="EPGBSendPanel._setTab('ticket')" ${!perms.ticket ? 'disabled' : ''}>
            <span class="sp-tab-icon">🎟</span>כרטיס
          </button>
          <button class="sp-tab" id="spTabInvite" onclick="EPGBSendPanel._setTab('invite')" ${!perms.invite ? 'disabled' : ''}>
            <span class="sp-tab-icon">📩</span>הזמנה
          </button>
        </div>

        <!-- CONTENT -->
        <div class="sp-content">

          <!-- ── WA ── -->
          <div class="sp-section active" id="spSectionWa">
            ${!perms.wa ? '<div class="sp-no-perm">אין הרשאה לשליחת הודעות</div>' : `
            <div class="sp-form-group">
              <label class="sp-label">הודעה — {שם} = שם אישי</label>
              <textarea class="sp-textarea" id="spWaMsg" oninput="EPGBSendPanel._updatePreview()" placeholder="היי {שם}! 🎸 יש לנו משהו בשבילך..."></textarea>
            </div>
            <div class="sp-preview-label">תצוגה מקדימה:</div>
            <div class="sp-preview" id="spWaPreview">—</div>
            <div class="sp-warning">⚠️ WA נפתח בנפרד לכל לקוח. אל תסגור חלונות לפני סיום השליחה.</div>
            <button class="sp-send-btn" onclick="EPGBSendPanel._sendWA()">שלח הודעה 💬</button>
            `}
          </div>

          <!-- ── GIFT ── -->
          <div class="sp-section" id="spSectionGift">
            ${!perms.gift ? '<div class="sp-no-perm">אין הרשאה לשליחת פינוקים</div>' : `
            <div class="sp-form-group">
              <label class="sp-label">סוג פינוק</label>
              <div class="sp-btn-group" id="spGiftTypeBtns">
                <button class="sp-btn-opt active" data-val="drink" onclick="EPGBSendPanel._setGiftType(this)">🥃 דרינק</button>
                <button class="sp-btn-opt" data-val="chaser" onclick="EPGBSendPanel._setGiftType(this)">🥂 צייסר</button>
                <button class="sp-btn-opt" data-val="beer" onclick="EPGBSendPanel._setGiftType(this)">🍺 בירה</button>
                <button class="sp-btn-opt" data-val="entry" onclick="EPGBSendPanel._setGiftType(this)">🎫 כניסה</button>
              </div>
            </div>
            <div class="sp-form-group">
              <label class="sp-label">כמות</label>
              <div class="sp-btn-group" id="spGiftQtyBtns">
                <button class="sp-btn-opt active" data-val="1" onclick="EPGBSendPanel._setGiftQty(this)">1</button>
                <button class="sp-btn-opt" data-val="2" onclick="EPGBSendPanel._setGiftQty(this)">2</button>
                <button class="sp-btn-opt" data-val="3" onclick="EPGBSendPanel._setGiftQty(this)">3</button>
                <button class="sp-btn-opt" data-val="5" onclick="EPGBSendPanel._setGiftQty(this)">5</button>
              </div>
            </div>
            <div class="sp-form-group">
              <label class="sp-label">הנחה</label>
              <div class="sp-btn-group" id="spDiscountBtns">
                <button class="sp-btn-opt active" data-val="100" onclick="EPGBSendPanel._setDiscount(this)">חינם</button>
                <button class="sp-btn-opt" data-val="50" onclick="EPGBSendPanel._setDiscount(this)">50%</button>
                <button class="sp-btn-opt" data-val="0" onclick="EPGBSendPanel._setDiscount(this)">ללא הנחה</button>
              </div>
            </div>
            <div class="sp-form-group">
              <label class="sp-label">הערה (אופציונלי)</label>
              <input type="text" class="sp-input" id="spGiftNote" placeholder="מהמנהל · יום הולדת · VIP...">
            </div>
            <button class="sp-send-btn" onclick="EPGBSendPanel._sendGift()">שלח פינוק 🎁</button>
            `}
          </div>

          <!-- ── TICKET ── -->
          <div class="sp-section" id="spSectionTicket">
            ${!perms.ticket ? '<div class="sp-no-perm">אין הרשאה לשליחת כרטיסים</div>' : `
            <div class="sp-form-group">
              <label class="sp-label">אירוע</label>
              <select class="sp-select" id="spTicketEvent">
                <option value="">טוען אירועים...</option>
              </select>
            </div>
            <div class="sp-form-group">
              <label class="sp-label">סוג כרטיס</label>
              <div class="sp-btn-group">
                <button class="sp-btn-opt active" data-val="BASIC" onclick="EPGBSendPanel._setOpt(this,'spTicketTypeBtns')">BASIC</button>
                <button class="sp-btn-opt" data-val="STANDARD" onclick="EPGBSendPanel._setOpt(this,'spTicketTypeBtns')">STANDARD</button>
                <button class="sp-btn-opt" data-val="PREMIUM" onclick="EPGBSendPanel._setOpt(this,'spTicketTypeBtns')">PREMIUM</button>
              </div>
            </div>
            <div class="sp-form-group">
              <label class="sp-label">הנחה</label>
              <div class="sp-btn-group" id="spTicketDiscBtns">
                <button class="sp-btn-opt active" data-val="100" onclick="EPGBSendPanel._setOpt(this,'spTicketDiscBtns')">חינם</button>
                <button class="sp-btn-opt" data-val="50" onclick="EPGBSendPanel._setOpt(this,'spTicketDiscBtns')">50%</button>
                <button class="sp-btn-opt" data-val="0" onclick="EPGBSendPanel._setOpt(this,'spTicketDiscBtns')">מחיר מלא</button>
              </div>
            </div>
            <div class="sp-form-group">
              <label class="sp-label">הערה (תופיע בכרטיס)</label>
              <input type="text" class="sp-input" id="spTicketNote" placeholder="VIP · מנהל · מתנה...">
            </div>
            <div class="sp-warning">⚠️ כרטיס יישלח ב-WhatsApp לכל נמען בנפרד.</div>
            <button class="sp-send-btn" onclick="EPGBSendPanel._sendTicket()">שלח כרטיס 🎟</button>
            `}
          </div>

          <!-- ── INVITE ── -->
          <div class="sp-section" id="spSectionInvite">
            ${!perms.invite ? '<div class="sp-no-perm">אין הרשאה לשליחת הזמנות</div>' : `
            <div class="sp-form-group">
              <label class="sp-label">אירוע</label>
              <select class="sp-select" id="spInviteEvent" onchange="EPGBSendPanel._updatePreview()">
                <option value="">— בחר אירוע —</option>
                <option value="general">📅 הודעה חופשית (ללא אירוע)</option>
              </select>
            </div>
            <div class="sp-form-group">
              <label class="sp-label">הודעה — {שם} = שם · {לינק} = לינק לאירוע</label>
              <textarea class="sp-textarea" id="spInviteMsg" oninput="EPGBSendPanel._updatePreview()"
                placeholder="היי {שם}! 🎸&#10;&#10;Radio E.P.G.B מזמין אותך לאירוע המיוחד שלנו!&#10;50 ראשונים נכנסים חינם 🎟&#10;&#10;{לינק}">היי {שם}! 🎸

Radio E.P.G.B מזמין אותך לאירוע המיוחד שלנו!
50 ראשונים נכנסים חינם 🎟

{לינק}</textarea>
            </div>
            <div class="sp-preview-label">תצוגה מקדימה:</div>
            <div class="sp-preview" id="spInvitePreview">—</div>
            <div class="sp-warning">⚠️ WA נפתח בנפרד לכל לקוח. שלח רק ללקוחות עם marketing_consent.</div>
            <button class="sp-send-btn" onclick="EPGBSendPanel._sendInvite()">שלח הזמנות 📩</button>
            `}
          </div>

        </div>

        <!-- PROGRESS -->
        <div class="sp-progress" id="spProgress">
          <div class="sp-progress-text" id="spProgressText">שולח...</div>
          <div class="sp-progress-bar-wrap">
            <div class="sp-progress-bar" id="spProgressBar" style="width:0%"></div>
          </div>
        </div>

      </div>
    </div>
    <div class="sp-toast" id="spToast"></div>
    `;
  }

  // ── פתיחה ──
  async function open({ recipients = [], context = 'customers', staffRole = 'admin' }) {
    injectCSS();

    state.allRecipients = recipients;
    state.context       = context;
    state.staffRole     = staffRole;
    state.selected      = new Set();
    state.activeTab     = 'wa';
    state.filters       = { gender: '', ticketType: '', redeemed: '', arrivedIn: '', vip: '' };

    // הסר overlay קיים
    const old = document.getElementById('epgbSendOverlay');
    if (old) old.remove();

    const div = document.createElement('div');
    div.innerHTML = buildHTML();
    document.body.appendChild(div.firstElementChild);
    // toast נפרד
    const toastEl = div.querySelector('.sp-toast');
    if (toastEl) document.body.appendChild(toastEl);

    _applyFilters();
    await _loadEvents();
  }

  function close() {
    const overlay = document.getElementById('epgbSendOverlay');
    if (overlay) overlay.remove();
    const toast = document.getElementById('spToast');
    if (toast) toast.remove();
  }

  function _overlayClick(e) {
    if (e.target.id === 'epgbSendOverlay') close();
  }

  // ── פילטרים ──
  function _applyFilters() {
    const gender   = document.getElementById('spFGender')?.value   || '';
    const ticket   = document.getElementById('spFTicket')?.value   || '';
    const redeemed = document.getElementById('spFRedeemed')?.value || '';
    const arrived  = document.getElementById('spFArrived')?.value  || '';
    const vip      = document.getElementById('spFVip')?.value      || '';

    const now = Date.now();

    let list = [...state.allRecipients];

    if (gender)   list = list.filter(r => r.gender === gender);
    if (ticket)   list = list.filter(r => (r.ticket_type || r.type) === ticket);
    if (redeemed === 'yes') list = list.filter(r => r.redeemed_at);
    if (redeemed === 'no')  list = list.filter(r => !r.redeemed_at);
    if (vip === 'vip')    list = list.filter(r => r.is_vip);
    if (vip === 'member') list = list.filter(r => r.is_club_member);

    if (arrived === '30')  list = list.filter(r => r.redeemed_at && (now - new Date(r.redeemed_at)) < 30*60*1000);
    if (arrived === '60')  list = list.filter(r => r.redeemed_at && (now - new Date(r.redeemed_at)) < 60*60*1000);
    if (arrived === '120') list = list.filter(r => r.redeemed_at && (now - new Date(r.redeemed_at)) < 120*60*1000);
    if (arrived === 'first20') list = list.filter(r => r.redeemed_at).sort((a,b) => new Date(a.redeemed_at)-new Date(b.redeemed_at)).slice(0,20);
    if (arrived === 'last20')  list = list.filter(r => r.redeemed_at).sort((a,b) => new Date(b.redeemed_at)-new Date(a.redeemed_at)).slice(0,20);

    state.filtered = list;

    // הסר נבחרים שנפלו מהפילטר
    state.selected.forEach(id => {
      if (!list.find(r => r.id === id)) state.selected.delete(id);
    });

    _updateCountDisplay();
  }

  function _updateCountDisplay() {
    const fcEl = document.getElementById('spFilteredCount');
    const scEl = document.getElementById('spSelectedCount');
    const btn  = document.getElementById('spSelectAllBtn');
    if (fcEl) fcEl.textContent = state.filtered.length;
    if (scEl) {
      const effectiveCount = _getRecipients().length;
      scEl.textContent = state.selected.size > 0
        ? `${state.selected.size}${state.sendLimit > 0 ? ' ('+effectiveCount+' ישלחו)' : ''}`
        : `${state.filtered.length}${state.sendLimit > 0 ? ' ('+effectiveCount+' ישלחו)' : ''}`;
    }
    if (btn) {
      const allSel = state.filtered.length > 0 && state.filtered.every(r => state.selected.has(r.id));
      btn.textContent = allSel ? `☑ בטל הכל` : `☐ בחר הכל (${state.filtered.length})`;
      btn.classList.toggle('all-selected', allSel);
    }
    _updateSentUI();
  }

  function _toggleSelectAll() {
    const allSel = state.filtered.length > 0 && state.filtered.every(r => state.selected.has(r.id));
    if (allSel) {
      state.selected.clear();
    } else {
      state.filtered.forEach(r => state.selected.add(r.id));
    }
    _updateCountDisplay();
  }

  // ── Tabs ──
  function _setTab(tab) {
    state.activeTab = tab;
    ['wa','gift','ticket','invite'].forEach(t => {
      document.getElementById(`spTab${t.charAt(0).toUpperCase()+t.slice(1)}`)?.classList.toggle('active', t === tab);
      document.getElementById(`spSection${t.charAt(0).toUpperCase()+t.slice(1)}`)?.classList.toggle('active', t === tab);
    });
    if (tab === 'wa' || tab === 'invite') _updatePreview();
  }

  // ── Options ──
  function _setGiftType(btn) {
    document.querySelectorAll('#spGiftTypeBtns .sp-btn-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.giftType = btn.dataset.val;
  }

  function _setGiftQty(btn) {
    document.querySelectorAll('#spGiftQtyBtns .sp-btn-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.giftQty = parseInt(btn.dataset.val);
  }

  function _setDiscount(btn) {
    document.querySelectorAll('#spDiscountBtns .sp-btn-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.discount = parseInt(btn.dataset.val);
  }

  function _setOpt(btn, groupId) {
    document.querySelectorAll(`#${groupId} .sp-btn-opt`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  // ── Preview ──
  function _updatePreview() {
    // WA preview
    const waMsg = document.getElementById('spWaMsg')?.value || '';
    const waEl  = document.getElementById('spWaPreview');
    if (waEl) {
      const sample = state.filtered[0] || state.allRecipients[0];
      waEl.textContent = waMsg.replace(/{שם}/g, sample?.name || 'ישראל') || '—';
    }

    // Invite preview
    const invMsg = document.getElementById('spInviteMsg')?.value || '';
    const invEl  = document.getElementById('spInvitePreview');
    if (invEl) {
      const eventId = document.getElementById('spInviteEvent')?.value || '';
      const link = eventId && eventId !== 'general'
        ? `https://epgb.co.il/event.html?id=${eventId}`
        : 'https://epgb.co.il';
      const sample = state.filtered[0] || state.allRecipients[0];
      invEl.textContent = invMsg
        .replace(/{שם}/g, sample?.name || 'ישראל')
        .replace(/{לינק}/g, link) || '—';
    }
  }

  // ── Load events ──
  async function _loadEvents() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/events?select=id,title,date&order=date.desc&limit=30`, { headers: HDRS });
      state.events = await res.json() || [];
      const opts = state.events.map(e =>
        `<option value="${e.id}">${e.title} · ${e.date ? new Date(e.date).toLocaleDateString('he-IL') : ''}</option>`
      ).join('');

      const ticketSel = document.getElementById('spTicketEvent');
      const inviteSel = document.getElementById('spInviteEvent');
      if (ticketSel) ticketSel.innerHTML = '<option value="">— בחר אירוע —</option>' + opts;
      if (inviteSel) inviteSel.innerHTML = '<option value="">— בחר אירוע —</option><option value="general">📅 הודעה חופשית</option>' + opts;
    } catch(e) { console.warn('send-panel: failed to load events', e); }
  }

  // ── Utils ──
  function toWAPhone(phone) {
    if (!phone) return '';
    let p = phone.replace(/[\s\-\(\)]/g, '');
    if (p.startsWith('+972')) p = '972' + p.slice(4);
    else if (p.startsWith('972')) { /* כבר תקין */ }
    else if (p.startsWith('0'))   p = '972' + p.slice(1);
    return p;
  }

  function _getRecipients() {
    const ids = state.selected.size > 0 ? state.selected : new Set(state.filtered.map(r => r.id));
    let list = state.allRecipients.filter(r => ids.has(r.id) && r.phone);
    // הסר כבר נשלחו
    list = list.filter(r => !state.sentIds.has(r.id));
    // החל לימיט
    if (state.sendLimit > 0) list = list.slice(0, state.sendLimit);
    return list;
  }

  function _setLimit(val) {
    state.sendLimit = parseInt(val) || 0;
    _updateCountDisplay();
  }

  function _selectRest() {
    // בחר את כל מי שעוד לא קיבל
    state.selected.clear();
    state.filtered
      .filter(r => !state.sentIds.has(r.id))
      .forEach(r => state.selected.add(r.id));
    _updateCountDisplay();
  }

  function _markSent(recipients) {
    recipients.forEach(r => state.sentIds.add(r.id));
    _updateSentUI();
  }

  function _updateSentUI() {
    const sentCount = state.sentIds.size;
    const restCount = state.filtered.filter(r => !state.sentIds.has(r.id)).length;
    const badge = document.getElementById('spSentBadge');
    const sentEl = document.getElementById('spSentCount');
    const restBtn = document.getElementById('spSendRestBtn');
    const restEl = document.getElementById('spRestCount');
    if (badge) badge.style.display = sentCount > 0 ? 'inline' : 'none';
    if (sentEl) sentEl.textContent = sentCount;
    if (restBtn) restBtn.style.display = sentCount > 0 && restCount > 0 ? 'inline-block' : 'none';
    if (restEl) restEl.textContent = restCount;
  }

  function _showToast(msg, isError = false) {
    let t = document.getElementById('spToast');
    if (!t) { t = document.createElement('div'); t.id = 'spToast'; t.className = 'sp-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = `sp-toast show${isError ? ' error' : ''}`;
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  function _setProgress(current, total, text) {
    const wrap = document.getElementById('spProgress');
    const bar  = document.getElementById('spProgressBar');
    const txt  = document.getElementById('spProgressText');
    if (!wrap) return;
    wrap.classList.toggle('active', total > 0);
    if (bar) bar.style.width = total > 0 ? `${Math.round(current/total*100)}%` : '0%';
    if (txt) txt.textContent = text || `שולח ${current} / ${total}...`;
  }

  function _unsubLink(phone) {
    const p = phone ? phone.replace(/[\s\-\(\)]/g,'').replace(/^972/,'0') : '';
    return `\n\nלהסרה מרשימת התפוצה:\nhttps://epgb.co.il/unsubscribe.html?phone=${encodeURIComponent(p)}`;
  }

  // ── שליחת WA ──
  function _sendWA() {
    const msg = document.getElementById('spWaMsg')?.value.trim();
    if (!msg) { _showToast('נא להכניס הודעה', true); return; }
    const recipients = _getRecipients().filter(r => !r.is_blocked && r.marketing_consent !== false);
    if (!recipients.length) { _showToast('אין נמענים — בחר לקוחות קודם', true); return; }
    if (!confirm(`לשלוח הודעה ל-${recipients.length} לקוחות?`)) return;
    _markSent(recipients);
    recipients.forEach((r, i) => {
      setTimeout(() => {
        const text = encodeURIComponent(msg.replace(/{שם}/g, r.name || '') + _unsubLink(r.phone));
        window.open(`https://wa.me/${toWAPhone(r.phone)}?text=${text}`, '_blank');
      }, i * 1500);
    });
    _showToast(`✓ שולח ל-${recipients.length} לקוחות`);
    state.selected.clear();
    _updateCountDisplay();
  }

  // ── שליחת פינוק ──
  async function _sendGift() {
    const recipients = _getRecipients().filter(r => !r.is_blocked);
    if (!recipients.length) { _showToast('אין נמענים — בחר לקוחות קודם', true); return; }
    if (!confirm(`לשלוח פינוק ל-${recipients.length} לקוחות?`)) return;

    _markSent(recipients);
    const note = document.getElementById('spGiftNote')?.value.trim() || '';
    const giftType = document.querySelector('#spGiftTypeBtns .sp-btn-opt.active')?.dataset.val || 'drink';
    const qty      = parseInt(document.querySelector('#spGiftQtyBtns .sp-btn-opt.active')?.dataset.val || '1');
    const disc     = parseInt(document.querySelector('#spDiscountBtns .sp-btn-opt.active')?.dataset.val || '100');

    let sent = 0;
    _setProgress(0, recipients.length, `יוצר פינוקים...`);

    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i];
      try {
        // יצור gift ב-Supabase
        const token = crypto.randomUUID();
        await fetch(`${SUPABASE_URL}/rest/v1/gifts`, {
          method: 'POST',
          headers: { ...HDRS, 'Prefer': 'return=representation' },
          body: JSON.stringify({
            customer_id: r.customer_id || r.id,
            type: giftType === 'entry' ? 'manual_gift' : 'manual_drink',
            qr_token: token,
            note: note || `פינוק מהצוות · ${qty} ${giftType}`,
            given_by: 'send_panel',
            redeemed: false,
            expires_at: new Date(Date.now() + 24*60*60*1000).toISOString()
          })
        });

        // שלח WA
        const link = `https://epgb.co.il/gift.html?id=${token}`;
        const typeLabel = { drink:'דרינק', chaser:'צייסר', beer:'בירה', entry:'כניסה' }[giftType] || giftType;
        const discLabel = disc === 100 ? 'חינם' : disc === 50 ? 'ב-50%' : '';
        const msg = encodeURIComponent(
          `היי ${r.name || ''}! 🎸\n\nRadio E.P.G.B שולח לך ${discLabel} ${qty} ${typeLabel}!\n${note ? note+'\n' : ''}\nלמימוש:\n${link}` + _unsubLink(r.phone)
        );
        setTimeout(() => window.open(`https://wa.me/${toWAPhone(r.phone)}?text=${msg}`, '_blank'), i * 1500);
        sent++;
      } catch(e) {
        console.error('send-panel gift error:', e);
      }
      _setProgress(i+1, recipients.length, `פינוק ${i+1} / ${recipients.length}`);
    }

    _showToast(`✓ ${sent} פינוקים נשלחו`);
    state.selected.clear();
    _updateCountDisplay();
  }

  // ── שליחת כרטיס ──
  async function _sendTicket() {
    const eventId = document.getElementById('spTicketEvent')?.value;
    if (!eventId) { _showToast('נא לבחור אירוע', true); return; }
    const recipients = _getRecipients().filter(r => !r.is_blocked && r.marketing_consent !== false);
    if (!recipients.length) { _showToast('אין נמענים — בחר לקוחות קודם', true); return; }
    if (!confirm(`לשלוח כרטיס ל-${recipients.length} לקוחות?`)) return;

    _markSent(recipients);
    const ticketType = document.querySelector('#spSectionTicket .sp-btn-opt.active[data-val]')?.dataset.val || 'BASIC';
    const note = document.getElementById('spTicketNote')?.value.trim() || '';
    const link = `https://epgb.co.il/free-ticket.html?event=${eventId}&type=${ticketType}`;

    recipients.forEach((r, i) => {
      setTimeout(() => {
        const phone = r.phone ? r.phone.replace(/[\s\-\(\)]/g,'').replace(/^972/,'0') : '';
        const personalLink = phone ? `${link}&phone=${encodeURIComponent(phone)}` : link;
        const msg = encodeURIComponent(
          `היי ${r.name || ''}! 🎸\n\nRadio E.P.G.B שולח לך כרטיס ${ticketType}!\n${note ? note+'\n' : ''}\nלמימוש:\n${personalLink}` + _unsubLink(r.phone)
        );
        window.open(`https://wa.me/${toWAPhone(r.phone)}?text=${msg}`, '_blank');
      }, i * 1500);
    });
    _showToast(`✓ כרטיסים נשלחו ל-${recipients.length} לקוחות`);
    state.selected.clear();
    _updateCountDisplay();
  }

  // ── שליחת הזמנה ──
  function _sendInvite() {
    const eventId = document.getElementById('spInviteEvent')?.value;
    if (!eventId) { _showToast('נא לבחור אירוע', true); return; }
    const msg = document.getElementById('spInviteMsg')?.value.trim();
    if (!msg) { _showToast('נא להכניס הודעה', true); return; }

    const recipients = _getRecipients().filter(r => !r.is_blocked && r.marketing_consent !== false);
    if (!recipients.length) { _showToast('אין נמענים תקינים (בדוק marketing_consent)', true); return; }
    if (!confirm(`לשלוח הזמנה ל-${recipients.length} לקוחות?`)) return;

    _markSent(recipients);
    const baseLink = eventId === 'general'
      ? 'https://epgb.co.il'
      : `https://epgb.co.il/event.html?id=${eventId}`;

    recipients.forEach((r, i) => {
      setTimeout(() => {
        const phone = r.phone ? r.phone.replace(/[\s\-\(\)]/g,'').replace(/^972/,'0') : '';
        const link = phone && eventId !== 'general'
          ? `${baseLink}&phone=${encodeURIComponent(phone)}`
          : baseLink;
        const text = encodeURIComponent(
          msg.replace(/{שם}/g, r.name || '').replace(/{לינק}/g, link) + _unsubLink(r.phone)
        );
        window.open(`https://wa.me/${toWAPhone(r.phone)}?text=${text}`, '_blank');
      }, i * 1500);
    });
    _showToast(`✓ הזמנות נשלחו ל-${recipients.length} לקוחות`);
    state.selected.clear();
    _updateCountDisplay();
  }

  // ── Public API ──
  return { open, close, _overlayClick, _applyFilters, _toggleSelectAll, _setTab, _setGiftType, _setGiftQty, _setDiscount, _setOpt, _updatePreview, _sendWA, _sendGift, _sendTicket, _sendInvite, _setLimit, _selectRest };

})();
