# Power BI Custom Visual: Login

A custom Power BI visual that provides a login interface with password-based organization filtering. The visual allows users to enter a password and filters the data source based on the organization value.

**Visual Name in Power BI:** Login  
**Package File:** `OrgPassFilter.1.0.6.0.pbiviz`  
**Version:** 1.0.6.0

## ⚠️ Important Limitations

**Password persistence does NOT work across multiple pages for end users (report viewers).** This is due to Power BI's architecture:
- Custom visuals create isolated instances on each page
- `persistProperties` only works for synchronized visuals (requires edit mode)
- Filters applied via `applyJsonFilter` are page-level, not report-level
- End users cannot synchronize visuals (viewer mode only)

**Recommended Use Cases:**
1. **Single-page dashboard** - Place all content on one scrollable page (no page navigation)
2. **Report editors only** - Password persistence works when visuals are synchronized in edit mode
3. **Use Power BI Row-Level Security (RLS) instead** - Proper enterprise solution for organization-based filtering

## Features

- **Password-based filtering**: Enter a password to filter data by organization
- **Admin password support**: Configure an admin password to view all data without organization filtering
- **Secure password input**: True password field (characters hidden)
- **Customizable title**: Change the component title/label via formatting options (default: "Login")
- **Secure access control**: Different passwords unlock different organizations
- **Page-level filtering**: Applies filters to all visuals on the current page
- **Dynamic filtering**: Filters are applied to the Power BI data model in real-time
- **Customizable password mapping**: Configure password-to-organization mappings via formatting options
- **Data protection**: Blocks all data access until a valid password is entered
- **Clean UI**: Power BI default title is hidden, showing only your custom title
- **User-friendly messages**: Displays custom error and success messages below the password field
- **Button visibility control**: Optional PasswordValid column support for conditional button visibility
- **Modal dialog mode**: Toggle between inline form and modal popup dialog (NEW in v1.0.6.0)
- **Power BI button trigger**: Open modal dialog from Power BI buttons using ShowLoginModal filter column (NEW in v1.0.6.0)

### ⚠️ Limitations

- **No cross-page persistence for viewers**: Password and filter do not persist when navigating to other pages in published reports
- **Page-level filters only**: Filters created by the visual only affect the current page
- **Requires re-entry**: Users must enter password again on each page (if visual is placed on multiple pages)

## Prerequisites

- Node.js (v14 or higher)
- Power BI Visuals Tools (`pbiviz` CLI)
- Power BI Desktop

## Installation

1. **Install Power BI Visuals Tools globally:**
   ```bash
   npm install -g powerbi-visuals-tools
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

## Building the Visual

1. **Build the visual package:**
   ```bash
   npm run build
   ```
   This creates `OrgPassFilter.1.0.6.0.pbiviz` in the `dist` folder.

2. **Or start the development server (optional):**
   ```bash
   npm start
   ```
   This starts a local server for development. Note: You'll still need to import the compiled `.pbiviz` file in Power BI Desktop for testing.

## Usage in Power BI

1. **Import the visual:**
   - Open Power BI Desktop
   - Go to **Visualizations** pane
   - Click the **...** (three dots) at the bottom
   - Select **Import a visual from a file**
   - Choose `OrgPassFilter.1.0.6.0.pbiviz` from the `dist` folder

2. **Add data:**
   - Import your `data.csv` file into Power BI
   - Drag the visual to your report canvas
   - Add your data fields to the visual (especially the Organization column)

3. **Configure the visual:**
   - Select the visual
   - Go to **Format visual** pane
   - **General Settings:**
     - **Title**: Customize the title/label displayed above the password input (default: "Login")
     - **Use Modal Dialog Mode**: Toggle to enable modal popup mode (default: disabled, shows inline form)
   - **Filter Settings:**
     - **Organization Password Mapping**: Edit the JSON mapping:
       ```json
       {
         "FAO123": "FAO",
         "UNICEF123": "UNICEF",
         "UNHCR123": "UNHCR",
         "WHO123": "WHO",
         "WIPO123": "WIPO"
       }
       ```
     - **Admin Password**: (Optional) Enter an admin password to view all data without organization filtering

4. **Use the visual:**
   - Enter a password in the input field (e.g., "FAO123")
   - Click **Enter** or press Enter
   - The visual will filter data by the corresponding organization
   - All visuals **on the same page** will be filtered automatically
   - Clear the password field and click Enter to reset the filter
   - **Admin mode**: Enter the admin password (if configured) to view all data without filtering

5. **⚠️ Important for multi-page reports:**
   - Password does NOT persist across pages for end users (viewers)
   - Users must re-enter password on each page if visual is placed on multiple pages
   - **Recommended**: Use one of these approaches instead:
     - **Single-page design**: Place all content on one scrollable page
     - **Power BI Row-Level Security (RLS)**: Assign users to roles (no password needed)
     - **Report editors**: Password persistence works when visuals are synchronized (edit mode only)

## Default Password Mappings

The visual comes with default password mappings:
- `FAO123` → FAO
- `UNICEF123` → UNICEF
- `UNHCR123` → UNHCR
- `WHO123` → WHO
- `WIPO123` → WIPO

You can customize these in the visual's formatting options.

## Admin Password Feature

The visual supports an optional admin password that bypasses organization filtering:

- **Configure Admin Password**: Set an admin password in **Filter Settings** → **Admin Password**
- **Admin Access**: When the admin password is entered, all filters are cleared and all data is displayed
- **Use Case**: Useful for administrators or reviewers who need to see all data across all organizations
- **Priority**: Admin password is checked first before organization password mappings
- **Message**: When admin password is used, you'll see "Admin access granted - showing all data"

## Modal Dialog Mode Feature (NEW in v1.0.6.0)

The visual now supports two display modes:

### Inline Mode (Default)
- Password form is displayed directly on the report page
- Traditional inline input field with submit button
- Best for: Always-visible login forms

### Modal Dialog Mode
- Password form appears in a modal popup dialog
- Cleaner UI - shows a "Login" button when not authenticated
- Shows logged-in status when password is valid
- Can be triggered by:
  - Clicking the visual's own "Login" button
  - Power BI buttons via `ShowLoginModal` filter column (set to "1")
- Best for: Space-saving designs and button-triggered authentication

**How to Enable Modal Mode:**
1. Select the visual
2. Go to **Format visual** → **General Settings**
3. Enable **"Use Modal Dialog Mode"**

**Power BI Button Integration:**
1. Add a calculated column `ShowLoginModal` to your data table (default value: "0")
2. Create a Power BI button
3. Configure button action to filter `ShowLoginModal` column to "1"
4. When button is clicked, the modal dialog will automatically open
5. After modal opens, the filter is automatically cleared

## Button Visibility Control Feature

The visual now supports conditional button visibility through an optional `PasswordValid` column:

- **How It Works**: When a valid password is entered, the visual sets `PasswordValid = "1"`. When invalid or cleared, it sets `PasswordValid = "0"`
- **Setup Required**: Add a `PasswordValid` column to your data model with default value "0"
- **Use Case**: Show/hide Power BI buttons based on password validation status
- **Non-Breaking**: This feature is completely optional - if the column doesn't exist, the visual works exactly as before
- **Implementation**: See `ONE_PAGE_DASHBOARD_GUIDE.md` for detailed step-by-step instructions on setting up buttons with conditional visibility

**Quick Setup:**
1. Add a calculated column named `PasswordValid` to your data table with default value `"0"`
2. Configure Power BI buttons to show/hide based on `PasswordValid` column value
3. When users enter a valid password, buttons will automatically appear

## Data Requirements

- Your dataset must contain an **Organization** column (or column with "Organization" or "Org" in the name)
- The visual will automatically detect the organization column (case-insensitive)
- The organization values should match the values in your password mapping exactly (case-sensitive)
- All visuals that need to be filtered must use the same data source table

## Password Persistence and Limitations

### Current Behavior

**Within the Same Visual Instance (Same Page):**
- ✅ Password is saved using Power BI's `persistProperties`
- ✅ Password persists if you refresh the page or return to it
- ✅ Filters apply to all visuals on the same page

**Across Multiple Pages for End Users (Viewers):**
- ❌ Password does NOT persist when navigating to other pages
- ❌ Filters do NOT persist across pages (page-level only)
- ❌ Each page creates a new visual instance with no shared state
- ❌ Users must re-enter password on each page

**For Report Editors (Edit Mode):**
- ✅ Password persists if visuals are synchronized (copy visual → choose "Synchronize")
- ⚠️ Only works in edit mode, not for end users viewing published reports

### Why This Limitation Exists

Power BI's architecture prevents cross-page state sharing for custom visuals in viewer mode:
- Custom visuals create isolated instances on each page
- `localStorage` and `sessionStorage` are blocked/unreliable in Power BI's sandbox (sessionStorage was removed from this visual as it's not reliable)
- `applyJsonFilter` creates page-level filters, not report-level filters
- `persistProperties` only works within the same instance or synchronized instances (edit mode only)
- End users (viewers) cannot synchronize visuals

### Recommended Solutions

**Option 1: Single-Page Dashboard (Works with Current Visual)**
- Place ALL content on ONE scrollable page
- Login section at top, data sections below
- Use bookmarks/buttons to show/hide sections
- No page navigation = no persistence problems
- **NEW**: Add a `PasswordValid` column to your data model to enable conditional button visibility
- **📖 See `ONE_PAGE_DASHBOARD_GUIDE.md` for complete step-by-step instructions**

**Option 2: Power BI Row-Level Security (Recommended Enterprise Solution)**
- Configure roles in Power BI Desktop (one role per organization)
- Assign users to roles in Power BI Service
- Users automatically see only their organization's data
- No password visual needed
- Works perfectly across all pages

**Option 3: Accept Re-Entry (Current Behavior)**
- Place visual on all pages
- Users re-enter password on each page
- Not ideal UX, but works

### Best Practice

For production reports with end users:
- **Use Power BI Row-Level Security (RLS)** instead of this visual
- Or design as a **single-page dashboard**

This visual is best suited for:
- Demo/prototype reports
- Reports used by editors (who can synchronize visuals)
- Single-page dashboards

## User Messages

The visual displays custom messages below the password field to provide user feedback:
- **Error messages**: "Please enter a password" or "Invalid password" when validation fails
- **Success messages**: "Access granted" when a valid password is entered (displays for 3 seconds)
- These messages appear directly below the password input field for clear visibility

## Security Considerations

⚠️ **Important Security Notes:**

- This visual provides **client-side password protection only** - it's not a secure authentication mechanism
- Passwords are stored in plain text in the visual's configuration and persisted properties
- This is suitable for basic access control within Power BI reports but should not be used for sensitive data protection
- For production use, consider implementing proper authentication at the data source level
- Password persistence is session-based and stored within the Power BI report file

## Project Structure

```
.
├── src/
│   ├── visual.ts              # Main visual logic
│   ├── settings.ts            # Formatting settings
│   └── PasswordModalDialog.ts # Modal dialog implementation
├── style/
│   └── visual.less        # Visual styling
├── capabilities.json      # Visual capabilities definition
├── pbiviz.json           # Visual configuration
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Troubleshooting

**Visual not appearing:**
- Make sure you've imported `OrgPassFilter.1.0.6.0.pbiviz` correctly
- Check that Power BI Desktop is updated to the latest version
- Try restarting Power BI Desktop after importing

**Filtering not working:**
- Verify that your data has an Organization column (or column with "Org" in the name)
- Check that the password mapping JSON is valid
- Ensure organization values match exactly (case-sensitive)
- Make sure all visuals that should be filtered use the same data source table

**No data displayed:**
- Enter a valid password first - the visual blocks all data until a password is entered
- Make sure data fields are added to the visual
- Check that the Organization column is properly mapped
- Verify your data is loaded correctly in Power BI

**Other visuals not filtering:**
- Ensure all visuals use the same data source table
- Verify that the Organization column exists in all visuals
- Check that the column names match exactly across all visuals

## Development

To modify the visual:

1. Edit the TypeScript files in `src/`
2. Modify styles in `style/visual.less`
3. Update capabilities in `capabilities.json`
4. Rebuild with `npm run build`
5. Re-import `OrgPassFilter.1.0.6.0.pbiviz` in Power BI Desktop

**Development Server:**
- Run `npm start` to start the development server (optional)
- Note: The development server is mainly useful for automatic recompilation
- For testing, import the compiled `.pbiviz` file directly in Power BI Desktop

## License

MIT

## References

- [Power BI Custom Visuals Documentation](https://learn.microsoft.com/en-us/power-bi/developer/visuals/)
- [Power BI Visuals API](https://github.com/Microsoft/PowerBI-Visuals)

