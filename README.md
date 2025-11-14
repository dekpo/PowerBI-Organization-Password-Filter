# Power BI Custom Visual: Organization Password Filter

A custom Power BI visual that allows users to enter a password and filters the data source based on the organization value.

## Features

- **Password-based filtering**: Enter a password to filter data by organization
- **Secure access control**: Different passwords unlock different organizations
- **Dynamic filtering**: Applies filters to Power BI data model
- **Data table display**: Shows filtered data in a clean table format
- **Customizable password mapping**: Configure password-to-organization mappings via formatting options

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
   This creates a `.pbiviz` file in the `dist` folder.

2. **Or start the development server:**
   ```bash
   npm start
   ```
   This starts a local server for testing the visual.

## Usage in Power BI

1. **Import the visual:**
   - Open Power BI Desktop
   - Go to **Visualizations** pane
   - Click the **...** (three dots) at the bottom
   - Select **Import a visual from a file**
   - Choose the `.pbiviz` file from the `dist` folder

2. **Add data:**
   - Import your `data.csv` file into Power BI
   - Drag the visual to your report canvas
   - Add your data fields to the visual (especially the Organization column)

3. **Configure password mapping:**
   - Select the visual
   - Go to **Format visual** pane
   - Expand **Filter Settings**
   - Edit the **Organization Password Mapping** JSON:
     ```json
     {
       "FAO123": "FAO",
       "UNICEF123": "UNICEF",
       "UNHCR123": "UNHCR",
       "WHO123": "WHO",
       "WIPO123": "WIPO"
     }
     ```

4. **Use the visual:**
   - Enter a password in the input field (e.g., "FAO123")
   - Click **Filter** or press Enter
   - The visual will filter data by the corresponding organization
   - The filtered data will be displayed in the table below

## Default Password Mappings

The visual comes with default password mappings:
- `FAO123` → FAO
- `UNICEF123` → UNICEF
- `UNHCR123` → UNHCR
- `WHO123` → WHO
- `WIPO123` → WIPO

You can customize these in the visual's formatting options.

## Data Requirements

- Your dataset must contain an **Organization** column (or column with "Organization" or "Org" in the name)
- The visual will automatically detect the organization column
- The organization values should match the values in your password mapping

## Security Considerations

⚠️ **Important Security Notes:**

- This visual provides **client-side password protection only** - it's not a secure authentication mechanism
- Passwords are stored in plain text in the visual's configuration
- This is suitable for basic access control within Power BI reports but should not be used for sensitive data protection
- For production use, consider implementing proper authentication at the data source level

## Project Structure

```
.
├── src/
│   ├── visual.ts          # Main visual logic
│   └── settings.ts        # Formatting settings
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
- Make sure you've imported the `.pbiviz` file correctly
- Check that Power BI Desktop is updated to the latest version

**Filtering not working:**
- Verify that your data has an Organization column
- Check that the password mapping JSON is valid
- Ensure organization values match exactly (case-sensitive)

**No data displayed:**
- Make sure data fields are added to the visual
- Check that the Organization column is properly mapped
- Verify your CSV data is loaded correctly in Power BI

## Development

To modify the visual:

1. Edit the TypeScript files in `src/`
2. Modify styles in `style/visual.less`
3. Update capabilities in `capabilities.json`
4. Rebuild with `npm run build`
5. Re-import the visual in Power BI Desktop

## License

MIT

## References

- [Power BI Custom Visuals Documentation](https://learn.microsoft.com/en-us/power-bi/developer/visuals/)
- [Power BI Visuals API](https://github.com/Microsoft/PowerBI-Visuals)

