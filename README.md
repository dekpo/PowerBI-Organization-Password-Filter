# PowerBI Organization Login Visual

A custom PowerBI visual providing password-based access control for public dashboards using **secure encryption**.

**Version:** 2.2.0.0

## 🔐 Security Model (v2.1.0+)

### **Encrypted Password Protection**
- Organization names are **encrypted with their passwords** using industry-standard encryption
- **No plaintext passwords** or organization names in the code
- Password acts as **decryption key** - only correct password can unlock the org
- **Much more secure** than plaintext JSON mappings

### **What This Provides:**
✅ **Encrypted storage** - Org names encrypted in code  
✅ **No visible passwords** - Can't see passwords by inspecting code  
✅ **Raises the bar** - Requires technical knowledge to break  
✅ **Good for:** Anonymous access, public partner dashboards, basic protection  

### **What This Doesn't Provide:**
❌ **Not military-grade** - Still client-side security  
❌ **Not enterprise security** - Determined attackers with technical expertise can analyze  
❌ **Not for:** Compliance (GDPR/HIPAA), highly confidential data  

**For enterprise security:** Use **PowerBI Row-Level Security (RLS)** with user authentication.

---

## Quick Start

### 1. Download and Import Visual (One-Time)

**Option A: Download Pre-built Release (Recommended)**
- Download: [OrgPassFilter.2.2.0.0.pbiviz](https://github.com/dekpo/PowerBI-Organization-Password-Filter/releases/download/v2.2.0/OrgPassFilter.2.2.0.0.pbiviz)
- Import to PowerBI Desktop: **Get more visuals** → **Import from file** → Select the `.pbiviz` file

**Option B: Build from Source**
```bash
npm install
pbiviz package
```
Output: `dist/OrgPassFilter.2.2.0.0.pbiviz`

### 2. Add Data
- Drag visual to canvas
- Add your data fields to **Data**
- Add Organization column to **Organization**

### 3. Configure Encrypted Passwords

**Option A: Use the Web Tool (Recommended for users)**
- Visit the [online documentation tool](https://[your-username].github.io/[repository-name]/docs/) (GitHub Pages)
- Paste CSV content or upload CSV file
- Generate encrypted JSON instantly
- Copy and paste into PowerBI settings

**Option B: Use the Command Line Tool**
```bash
node tools/encrypt-passwords.js
```

Copy the JSON output and paste into:
- PowerBI → Select visual → **Format visual** → **Security Settings** → **Encrypted Mappings (JSON)**

### 4. Test
- Enter a password from your `OrgPass.csv` (e.g., `A7F9D2C4E1`)
- Click **Enter**
- Data should filter to that organization (e.g., FAO)

**✨ Easy password updates:**
- Edit `OrgPass.csv` → Run script → Copy JSON → Paste in PowerBI
- **NO REBUILD NEEDED!**

---

## Features

### Password Filtering
- Users enter password → Visual filters data by organization
- Works across all visuals on the same page
- Data blocked until valid password entered

### Admin Password (Optional)
- Set in **Security Settings** → **Admin Password**
- Admin sees ALL organizations without filtering
- Useful for support/troubleshooting

### Display Modes
- **Inline Mode** (default): Form always visible
- **Modal Mode**: Popup dialog, saves space
- Toggle in **General Settings** → **Use Modal Mode**

---

## Configuration

### Updating Organization Passwords

**Easy workflow - NO REBUILD NEEDED:**

1. **Edit `OrgPass.csv`** in the project root:
```csv
Organization,Password
FAO,A7F9D2C4E1
IAEA,B3E8A6F1D9
...
```

2. **Run the encryption script:**
```bash
node tools/encrypt-passwords.js
```

3. **Copy the encrypted JSON** from the output

4. **Paste into PowerBI:**
   - Select visual → **Format visual** → **Security Settings**
   - Paste into **Encrypted Mappings (JSON)** field

5. **Done!** Refresh visual - passwords updated

**Your OrgPass.csv passwords:**
- `A7F9D2C4E1` → FAO
- `B3E8A6F1D9` → IAEA
- `C9D4B7E2A5` → ICAO
- `D1F6C8A3E7` → IFAD
- `E5A9D3F7B2` → ILO
- `F8C2E4A1D6` → IMO
- `G4E7B9D1F3` → IOM
- `H2A5F8C7E9` → ITU
- `I6D3E1B8F4` → UN Secretariat
- `J9F2A4C6E7` → UNAIDS
- `K3E8D7F1A5` → UNDP
- `L7A2F9C4E8` → UNEP
- `M5D1E3F7B9` → UNESCO
- `N8C6A4E2F3` → UNFCCC
- `O2F7D9B3E6` → UNFPA
- `P4E1A8F5C7` → UN-HABITAT
- `Q9D3F2E6A8` → UNHCR
- `R6A7C4F9E1` → UNICEF
- `S3F8E2D5A9` → UNIDO
- `T1E6F4A3C8` → UNOPS
- `U7D9A2F5E3` → UNRWA
- `V5F1C8E7A4` → UNWOMEN
- `W8A3F6D2E9` → UN Tourism
- `X2E9F7A5C3` → UPU
- `Y4F3D8E1A6` → WFP
- `Z9A7E2F5C8` → WHO
- `A3F6E9D1B4` → WIPO
- `B8E2F4A7C5` → WMO
- `C1F9D3E6A8` → WORLD BANK
- `D7A4F2E8C3` → WTO

**These are encrypted in the code - not visible as plaintext!**

### Admin Password (Optional)

**In PowerBI → Format visual → Security Settings → Admin Password**

Set a separate password (e.g., `SuperAdmin2024`) to view ALL organizations. This is configured in PowerBI, not in the code.

### Visual Settings

**In General Settings:**
- **Title**: Customize form title (default: "Organization Login")
- **Use Modal Mode**: Toggle popup dialog mode

---

## Data Requirements

- Your data must have an **Organization** column (or column containing "org")
- Organization values must match password mapping exactly (case-sensitive)
- All visuals must use the same data source table for filtering to work

---

## Usage

### For End Users
1. Open dashboard
2. All data is blocked (hidden)
3. Enter password
4. Click **Enter**
5. View filtered data for your organization

### For Admins
1. Enter admin password
2. View ALL organizations

### Modal Mode
1. Enable in **General Settings** → **Use Modal Mode**
2. Visual shows compact status box
3. Click button to open password dialog

---

## Limitations

### Security
- ❌ Passwords visible in browser JavaScript to technical users
- ❌ Not suitable for highly sensitive data
- ❌ No user authentication or access tracking
- ✅ Good for basic "friendly barrier" protection

### Filtering
- ✅ Filters all visuals on the SAME page
- ❌ Filters do NOT persist across pages
- ❌ Users must re-enter password on each page (if visual on multiple pages)

### Recommendations
- **Single-page dashboard**: Put all content on one scrollable page
- **Or use PowerBI RLS**: For true security with user authentication

---

## Troubleshooting

### Build Error
```bash
npm install
npm cache clean --force
pbiviz package
```

### Password Doesn't Work
1. Verify `OrgPass.csv` format is correct
2. Re-run `node tools/encrypt-passwords.js`
3. Ensure you copied the encrypted JSON into PowerBI settings
4. Check the JSON is pasted correctly (should start with `[` and end with `]`)
5. Refresh the visual in PowerBI

### Encryption Script Error
- Ensure `OrgPass.csv` exists in project root
- Check CSV format: `Organization,Password` header
- No empty lines between data rows

### "No password mappings configured" Error
- Run `node tools/encrypt-passwords.js` to generate encrypted JSON
- Copy the JSON output
- Paste into PowerBI: Format visual → Security Settings → Encrypted Mappings
- Make sure JSON is valid (starts with `[` and ends with `]`)

### Data Not Filtering
- Ensure Organization column is added to visual
- Verify other visuals use same data table
- Check organization column exists in all visuals

### Visual Not Appearing
- Update PowerBI Desktop to latest version
- Restart PowerBI after import
- Check `.pbiviz` file imported correctly

---

## When to Use PowerBI RLS Instead

Use **Row-Level Security (RLS)** if you need:
- ✅ Enterprise-grade security
- ✅ User authentication (Azure AD, etc.)
- ✅ Compliance requirements
- ✅ Per-user access tracking
- ✅ Cross-page filtering

**Setup RLS:**
1. PowerBI Desktop → **Modeling** → **Manage Roles**
2. Create role: `[Organization] = USERNAME()`
3. Publish to PowerBI Service
4. Assign users to roles

[PowerBI RLS Documentation](https://learn.microsoft.com/en-us/power-bi/admin/service-admin-rls)

---

## Version History

### v2.2.0.0 (Current - Simplified JSON Format)
- ✨ **Simplified JSON format:** Changed from `[{"e":"..."}]` to `["..."]` 
- Removed redundant wrapper object - cleaner and simpler
- **Breaking change:** Existing encrypted mappings need to be regenerated
- Run `node tools/encrypt-passwords.js` to get new format

### v2.1.0.0 (Encrypted)
- 🔐 **Major security improvement:** Secure encryption for passwords
- Organization names encrypted with their passwords
- No plaintext passwords or org names in code
- Password acts as decryption key
- Much more secure than plaintext JSON
- Encryption script: `tools/encrypt-passwords.js`
- Dependencies: Added `crypto-js` for encryption

### v2.0.0.0
- Complete rewrite and simplification
- Removed dataset table complexity
- JSON configuration (now replaced with encrypted)
- 68% code reduction

### v1.0.7.0 (Legacy)
- Dataset table approach
- Complex password persistence
- PasswordValid field

---

## Development

### Project Structure
```
├── src/
│   ├── visual.ts              # Main visual logic with encryption
│   ├── settings.ts            # Settings (2 cards)
│   └── PasswordModalDialog.ts # Modal dialog
├── tools/
│   └── encrypt-passwords.js   # Password encryption script
├── style/visual.less          # Styling
├── capabilities.json          # Visual definition
├── pbiviz.json               # Configuration
├── OrgPass.csv               # Your password mappings
└── README.md                 # This file
```

### Build Commands
```bash
npm install                    # Install dependencies
node tools/encrypt-passwords.js # Generate encrypted mappings
pbiviz package                 # Build .pbiviz file
pbiviz start                   # Dev server (optional)
```

### Updating Passwords (No Rebuild!)
1. Edit `OrgPass.csv`
2. Run `node tools/encrypt-passwords.js`
3. Copy encrypted JSON output
4. Paste into PowerBI Settings → Security Settings → Encrypted Mappings
5. Done! Visual updates immediately

---

## License

MIT

## Support

- Check JSON syntax: [JSONLint](https://jsonlint.com/)
- Test with sample passwords first
- Verify organization names match exactly
- Use browser console (F12) for errors

---

## Power BI Custom Visuals - Technical Overview

### What This Solution Is Built On

This visual is a **JavaScript/TypeScript-based custom Power BI component** that extends Power BI's native capabilities. Understanding what's possible (and what isn't) helps frame technical discussions and future development decisions.

### Development Capabilities

#### **What Can Be Built with JavaScript/TypeScript Custom Visuals**

**✅ Interactive UI Components** (like this project)
- Navigation menus, tabs, accordions
- Filter controls and search interfaces
- Custom forms and dialogs
- Password protection and access control
- Bookmark navigation integration

**✅ Custom Visualizations**
- Any chart type not in Power BI core visuals
- Network diagrams, custom maps, specialized graphs
- Real-time data displays
- Text analytics and word clouds

**✅ Advanced Interactions**
- Cross-filtering other visuals on same page
- Click/hover/drag interactions
- Conditional show/hide based on data
- Responsive layouts that adapt to size

**✅ Integration Capabilities**
- Power BI Filtering API (cross-visual filtering)
- Power BI Bookmarks API (page navigation)
- Power BI Dialog API (modal popups)
- External JavaScript libraries (D3.js, Chart.js, etc.)

#### **R and Python Visuals (Alternative Approach)**

Power BI also supports **R and Python-powered visuals** for statistical/scientific use cases:

**Best for:**
- Advanced statistical analysis
- Scientific/academic visualizations (ggplot2, matplotlib)
- Machine learning result displays
- Complex statistical models

**Limitations:**
- Server-side execution (slower)
- Limited interactivity (mostly static images)
- Requires R/Python runtime on viewing machine
- Not suitable for UI components or navigation

**Our solution uses JavaScript/TypeScript** because it requires rich interactivity, real-time filtering, and UI control.

### Key Advantages of JavaScript/TypeScript Approach

| Feature | Benefit |
|---------|---------|
| **Client-side execution** | Fast, no server round-trips |
| **Rich interactivity** | Click, hover, drag, selection |
| **Cross-filtering** | Filter other visuals seamlessly |
| **No runtime dependencies** | Runs directly in browser |
| **Modern web tech** | Leverage HTML5/CSS3/ES6+ |
| **Easy distribution** | Single `.pbiviz` file |

### Technical Limitations to Understand

#### **Security Constraints**
- ❌ **All code runs client-side** - Visible to technical users in browser
- ❌ **No server-side secrets** - Cannot securely store sensitive data
- ❌ **Sandboxed environment** - Limited browser API access
- ✅ **Our approach:** AES-256 encryption raises the bar significantly
- ✅ **Enterprise alternative:** Power BI Row-Level Security (RLS) for true authentication

#### **Functional Boundaries**
- ❌ **Same-page filtering only** - Cross-filtering doesn't persist across pages
- ❌ **No data persistence** - Can't save state between sessions
- ❌ **No backend database** - Only works with Power BI-provided data
- ❌ **Limited external API calls** - CORS and security restrictions

#### **When to Use What**

**Use Custom JavaScript Visuals (like ours) when:**
- Need unique UI/navigation components
- Require custom interactions and filtering
- Want tight Power BI integration
- Building public/partner dashboards with basic protection

**Use Power BI RLS instead when:**
- Need enterprise-grade security
- Require user authentication (Azure AD)
- Need compliance (GDPR/HIPAA)
- Need cross-page filtering
- Need audit trails and per-user access tracking

### Architecture Overview

```
Power BI Custom Visual (TypeScript)
├── Visual API 5.3.0
│   ├── Data binding (capabilities.json)
│   ├── Settings panel (formatting model)
│   └── Cross-filtering (selection manager)
│
├── UI Layer
│   ├── HTML/CSS (inline & modal modes)
│   ├── Password dialog component
│   └── Event handling
│
├── Business Logic
│   ├── AES-256 encryption (CryptoJS)
│   ├── Password validation
│   ├── Organization filtering
│   └── State management
│
└── Power BI Integration
    ├── Dialog API (modal popups)
    ├── Filter API (cross-visual filtering)
    └── Bookmark API (navigation)
```

### For Technical Discussions

**Key Points:**
1. **Client-side architecture** - All logic runs in user's browser
2. **Encryption approach** - AES-256 with password as key, significantly more secure than plaintext
3. **Filtering mechanism** - Uses Power BI's native filtering API for cross-visual communication
4. **Configuration model** - Encrypted JSON in settings (no rebuild needed for password updates)
5. **Security positioning** - "Friendly barrier" for public dashboards, not enterprise authentication

**Common Questions:**
- *Can passwords be seen?* Yes, with technical expertise and browser dev tools (client-side limitation)
- *Can this work across pages?* No, Power BI filtering is page-scoped
- *Can we add user authentication?* Not in custom visuals - use Power BI RLS for that
- *Can we track who accessed what?* No, use Power BI RLS with Azure AD for audit trails

---

## References

- [PowerBI Custom Visuals Docs](https://learn.microsoft.com/en-us/power-bi/developer/visuals/)
- [PowerBI Row-Level Security](https://learn.microsoft.com/en-us/power-bi/admin/service-admin-rls)
- [Power BI Visuals API](https://learn.microsoft.com/en-us/power-bi/developer/visuals/visual-api)
