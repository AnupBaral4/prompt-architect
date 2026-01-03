# 🏗️ Prompt Architect v6.0

> **Professional AI Prompt Generation System for Midjourney V6.0 & DALL-E 3**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://promptsarchitect.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Made with HTML5](https://img.shields.io/badge/made%20with-HTML5-E34F26.svg)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Vanilla JS](https://img.shields.io/badge/vanilla-JS-F7DF1E.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/styled%20with-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com)

---

## 📖 Overview

**Prompt Architect** is an industrial-grade, client-side prompt generation tool designed for AI artists, designers, and creators. Build optimized prompts for **Midjourney V6.0** and **DALL-E 3** using an intuitive interface with curated attribute libraries, advanced parameter controls, and pre-configured neural blueprints.

### ✨ Key Features

- 🎨 **6 Curated Categories** - Art Style, Composition, Mood, Lighting, Palette, Quality
- ⚙️ **Advanced Parameters** - Aspect Ratio, Stylize, Chaos, Negative Prompts
- 🧠 **Neural Blueprints** - Pre-configured templates with full parameter sets
- 🎭 **Real-Time Synthesis** - Live prompt preview with syntax highlighting
- 📋 **One-Click Copy** - Industrial-style button with animation feedback
- 🖼️ **Gallery Showcase** - Full-screen image viewer with downloadable prompts
- 🔒 **Privacy-First** - 100% client-side, no data collection or tracking
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile

---

## 🚀 Live Demo

**Visit:** [promptsarchitect.com](https://promptsarchitect.com)

---

## 🎯 Use Cases

- **AI Artists** - Generate precise prompts for Midjourney and DALL-E
- **Designers** - Quickly iterate on visual concepts with parameter control
- **Content Creators** - Build consistent prompts for branded imagery
- **Prompt Engineers** - Learn optimal prompt structures and parameters
- **Educators** - Teach AI art generation with visual prompt building

---

## 🛠️ Tech Stack

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Advanced animations, 3D transforms, glassmorphism
- **Vanilla JavaScript (ES6+)** - No frameworks, lightweight and fast
- **Tailwind CSS** (CDN) - Utility-first styling

### **Fonts**
- **Inter** (200-700) - UI typography
- **JetBrains Mono** (400, 500) - Code/technical elements

### **External Services**
- **Web3Forms** - Contact form backend
- **Google Analytics** - Privacy-respecting analytics
- **Unsplash** - Hero background imagery

### **Performance**
- ⚡ **No build process** required
- 📦 **~50KB** total page weight (excluding images)
- 🚀 **<100ms** interaction response time
- ♿ **WCAG 2.1 AA** accessibility compliant

---

## 📂 Project Structure

```
prompt-architect/
│
├── index.html                  # Main prompt builder
├── about.html                  # About page
├── gallery.html                # Image gallery with full-screen viewer
├── faq.html                    # FAQ with accordion interface
├── contact.html                # Contact form (Web3Forms)
│
├── styles.css                  # Global styles & animations
├── script.js                   # Core functionality
│
├── favicon.png                 # Site favicon
│
├── cyberpunk-city-showcase.jpg     # Gallery image 1
├── mountain-sunrise-showcase.jpg   # Gallery image 2
├── scifi-control-showcase.jpg      # Gallery image 3
├── featured-exclusive-01.jpg       # Gallery image 4 (exclusive)
│
└── README.md                   # This file
```

---

## 🎨 Design System

### **Color Palette**
```css
--bg-color: #0a0a0a         /* Deep black */
--surface: #151515          /* Dark gray */
--border: #252525           /* Medium gray */
--text-main: #ffffff        /* White */
--text-muted: #888888       /* Muted gray */
--accent: #00ff88           /* Emerald green */
```

### **Typography**
- **Headings:** Inter (200-700)
- **Body:** Inter (400-500)
- **Code/Technical:** JetBrains Mono (400-500)

### **Design Principles**
- Industrial/Tech-Noir aesthetic
- Sharp corners (no excessive rounding)
- Glassmorphism effects (backdrop-blur)
- Green accent for interactive elements
- Micro-animations everywhere

---

## 🔧 Installation

### **Option 1: Clone the Repository**
```bash
git clone https://github.com/AnupBaral4/prompt-architect.git
cd prompt-architect
```

### **Option 2: Download ZIP**
1. Download the repository as ZIP
2. Extract to your local machine
3. Open `index.html` in your browser

### **Requirements**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Internet connection (for CDN resources)
- No server required - runs entirely client-side

---

## 🚀 Deployment

### **Static Hosting Platforms**

#### **Vercel** (Recommended)
```bash
npm i -g vercel
vercel
```

#### **Netlify**
```bash
npm i -g netlify-cli
netlify deploy
```

#### **GitHub Pages**
1. Push code to GitHub repository
2. Settings → Pages → Select branch
3. Site published at `https://username.github.io/repo-name`

#### **Cloudflare Pages**
1. Connect GitHub repository
2. Build settings: None (static site)
3. Deploy automatically on push

---

## 📖 Usage Guide

### **Basic Workflow**

1. **Enter Subject**
   ```
   Type your main concept (e.g., "futuristic cityscape")
   ```

2. **Select Attributes**
   - Choose from 6 categories (Style, Composition, Mood, etc.)
   - Click chips to toggle selection

3. **Adjust Technical Parameters**
   - Aspect Ratio: 1:1, 4:5, 16:9, 9:16
   - Stylize: 0-1000 (default: 100)
   - Chaos: 0-100 (default: 0)
   - Negative Prompt: Things to exclude

4. **Copy Final Prompt**
   - Click "Copy Final String" button
   - Paste into Midjourney or DALL-E

### **Using Neural Blueprints**

1. Navigate to "Neural Blueprints" section
2. Click any card (CYBER_CITY, ETHEREAL_SOUL, BRUTALIST_FORM)
3. All parameters auto-populate
4. Modify as needed or use as-is

### **Gallery Features**

1. Click any image to view full prompt
2. Copy prompts with one click
3. Click image in modal for full-screen view
4. Download images or close with ESC

---

## 🎯 Feature Breakdown

### **1. Subject Input**
- Large, focused text field
- 3D rotating Smart Core indicator
- Animated underline on focus

### **2. Attribute Categories**
- **Art Style:** Minimalism, Cinematic, Hyper-realistic, etc.
- **Composition:** Rule of Thirds, Bird's Eye View, etc.
- **Mood:** Ethereal, Melancholic, Energetic, etc.
- **Lighting:** Golden Hour, Volumetric Fog, etc.
- **Palette:** Monochrome, Pastel, Neon, etc.
- **Quality:** 8k, Ray Tracing, Masterpiece, etc.

### **3. Technical Parameters**
- **Aspect Ratio** - 4 preset options
- **Stylize** - Slider (0-1000)
- **Chaos** - Slider (0-100)
- **Negative Prompt** - Text input for exclusions

### **4. Prompt Synthesis**
- Real-time output preview
- Syntax highlighting:
  - Green: Subject
  - White underlined: Modifiers
  - Gray: Technical parameters
- Copy button with multi-stage animation

### **5. Neural Blueprints**
- 3 pre-configured templates
- One-click parameter loading
- Full parameter sets (aspect, stylize, chaos, negative)

### **6. Gallery**
- 4 featured images
- Modal view with details
- Full-screen image viewer
- Copy prompts (except exclusive)
- Download images

---

## 🔒 Privacy & Security

### **Data Handling**
- ✅ **100% Client-Side** - All processing in browser
- ✅ **No Database** - Nothing stored on servers
- ✅ **No Cookies** - Except Google Analytics (optional)
- ✅ **No Tracking** - Privacy-respecting analytics only
- ✅ **Open Source** - Transparent code

### **Third-Party Services**
- **Web3Forms** - Contact form only (GDPR compliant)
- **Google Analytics** - Anonymized visitor stats
- **Google Fonts** - Typography loading
- **Tailwind CDN** - Styling framework
- **Unsplash** - Background imagery

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### **Reporting Issues**
1. Check existing issues first
2. Provide clear description
3. Include browser/OS details
4. Add screenshots if relevant

### **Pull Requests**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### **Code Style**
- Use descriptive variable names
- Comment complex logic
- Maintain existing formatting
- Test on multiple browsers
- Keep mobile responsive

---

## 📝 Roadmap

### **v6.1** (Planned)
- [ ] More neural blueprints (10+ templates)
- [ ] Export prompt history
- [ ] Share prompts via URL
- [ ] Dark/light theme toggle

### **v6.2** (Future)
- [ ] Stable Diffusion support
- [ ] Prompt variations generator
- [ ] Advanced parameter presets
- [ ] Image-to-prompt analysis

### **v7.0** (Vision)
- [ ] User accounts (optional)
- [ ] Community blueprints
- [ ] Prompt versioning
- [ ] API integration

---

## 🐛 Known Issues

### **Minor Issues**
- Tailwind CDN warning in production (cosmetic only)
- Modal animation stutter on slow devices (rare)

### **Browser Compatibility**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11 not supported (use modern browser)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **What This Means**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❗ License and copyright notice required

---

## 👥 Credits

### **Created By**
- **Prompt Architect Team** - Design & Development

### **Built With**
- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS (utility framework)
- Inter & JetBrains Mono (Google Fonts)

### **Special Thanks**
- Midjourney community for inspiration
- DALL-E artists for feedback
- Open source contributors

---

## 📞 Contact & Support

### **Get Help**
- 📧 **Email:** [dev.promptarchitect@gmail.com](mailto:dev.promptarchitect@gmail.com)
- 📸 **Instagram:** [@prompts.architect](https://instagram.com/prompts.architect)
- 🌐 **Website:** [promptsarchitect.com](https://promptsarchitect.com)
- 💻 **GitHub:** [AnupBaral4/prompt-architect](https://github.com/AnupBaral4/prompt-architect)

### **Report Bugs**
- Open an issue on GitHub with details
- Include browser version and OS
- Attach screenshots if possible

### **Feature Requests**
- Open a discussion on GitHub
- Describe the use case
- Explain expected behavior

---

## 🌟 Show Your Support

If you find Prompt Architect useful:

- ⭐ **Star this repository** on GitHub
- 🔀 **Share with fellow creators**
- 📸 **Follow us on Instagram** [@prompts.architect](https://instagram.com/prompts.architect)
- 💬 **Spread the word** in AI art communities

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/AnupBaral4/prompt-architect?style=social)
![GitHub forks](https://img.shields.io/github/forks/AnupBaral4/prompt-architect?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/AnupBaral4/prompt-architect?style=social)

---

## 🎨 Screenshots

### Main Prompt Builder
![Prompt Builder](screenshots/builder.png)
*Real-time prompt synthesis with curated attribute libraries*

### Prompt Output Box
![Prompt Output](screenshots/promptbox.png)
*Live synthesis preview with syntax highlighting and copy functionality*

### Neural Blueprints
![Neural Blueprints](screenshots/blueprint.png)
*Pre-configured templates with complete parameter sets*

### Blueprint Hover Effects
![Blueprint Hover](screenshots/blueprintwithhovereffects.png)
*Interactive card animations and visual feedback*

### Gallery Showcase
![Gallery](screenshots/gallery.png)
*Featured images with copyable prompts and full metadata*

### Full-Screen Image Viewer
![Image Preview](screenshots/imagepreview.png)
*High-resolution image preview with download and zoom options*

---

<div align="center">

**Built with ❤️ by Anup Baral**

[Website](https://promptsarchitect.com) • [Instagram](https://instagram.com/prompts.architect) • [Email](mailto:dev.promptarchitect@gmail.com) • [GitHub](https://github.com/AnupBaral4/prompt-architect)

---

**© 2025 Prompt Architect | AI Prompt Generation Tool**

</div>