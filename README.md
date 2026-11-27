# Kelsey Media Artwork Specifications

A static, GitHub Pages-ready website for Kelsey Media print and digital advertising specifications.

## Publish with GitHub Pages
1. Create a new GitHub repository (for example `kelsey-media-specs`).
2. Upload all files and folders in this project to the repository root. Keep `assets/` intact.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select **main** and **/(root)**, then Save.
6. GitHub will publish the site at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

## Update specifications
Edit `data.json` to update publication details or digital requirements. The layout and search/filter functionality are in `app.js` and `styles.css`.

## Source notes
- Print publication names, trim sizes, printers and advert format dimensions: supplied `ALL SPECS_2026.pdf`.
- Digital formats, dimensions, file types, file-size limits and supply notes: supplied `Digital Specs.xlsx`.
- A publication listed as 265 × 310 mm (Agricultural Trader) has no matching advert-format panel in the supplied print PDF, so the site flags it for Production confirmation rather than inferring dimensions.
- The source file lists Crop Production Mag printer as TBC.
