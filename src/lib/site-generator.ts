import { ExtractedContent } from './ai-extractor';

export function generateHTML(content: ExtractedContent): string {
  const featuresHTML = content.features
    .map(
      (feature) => `
        <div class="feature-card">
          <h3>${escapeHtml(feature.title)}</h3>
          <p>${escapeHtml(feature.description)}</p>
        </div>
      `
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(content.tagline)}">
  <title>${escapeHtml(content.companyName)} - ${escapeHtml(content.tagline)}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Navigation -->
  <nav class="nav">
    <div class="nav-container">
      <a href="#" class="nav-logo">${escapeHtml(content.companyName)}</a>
      <button class="nav-toggle" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="#cta" class="nav-cta">${escapeHtml(content.cta)}</a>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <h1>${escapeHtml(content.companyName)}</h1>
      <p class="hero-tagline">${escapeHtml(content.tagline)}</p>
      <p class="hero-description">${escapeHtml(content.solution)}</p>
      <a href="#cta" class="btn btn-primary">${escapeHtml(content.cta)}</a>
    </div>
  </section>

  <!-- Problem Section -->
  <section class="section section-alt" id="about">
    <div class="container">
      <h2>The Challenge</h2>
      <p class="section-text">${escapeHtml(content.problem)}</p>
    </div>
  </section>

  <!-- Features Section -->
  <section class="section" id="features">
    <div class="container">
      <h2>Features</h2>
      <div class="features-grid">
        ${featuresHTML}
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="section section-cta" id="cta">
    <div class="container">
      <h2>Ready to get started?</h2>
      <p>Join us and experience the difference.</p>
      <a href="${content.contactEmail ? `mailto:${escapeHtml(content.contactEmail)}` : '#'}" class="btn btn-primary btn-lg">${escapeHtml(content.cta)}</a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer" id="contact">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <h3>${escapeHtml(content.companyName)}</h3>
          <p>${escapeHtml(content.tagline)}</p>
        </div>
        <div class="footer-contact">
          <h4>Contact</h4>
          ${content.contactEmail ? `<p><a href="mailto:${escapeHtml(content.contactEmail)}">${escapeHtml(content.contactEmail)}</a></p>` : ''}
          ${content.website ? `<p><a href="${escapeHtml(content.website)}" target="_blank">${escapeHtml(content.website)}</a></p>` : ''}
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${escapeHtml(content.companyName)}. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;
}

export function generateCSS(): string {
  return `/* Modern SaaS Landing Page Styles */
:root {
  --primary: #3b82f6;
  --primary-dark: #2563eb;
  --text: #1f2937;
  --text-light: #6b7280;
  --bg: #ffffff;
  --bg-alt: #f9fafb;
  --border: #e5e7eb;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text);
  line-height: 1.6;
  background: var(--bg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Navigation */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-links a {
  color: var(--text-light);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--primary);
}

.nav-cta {
  background: var(--primary) !important;
  color: white !important;
  padding: 10px 20px;
  border-radius: 8px;
  transition: background 0.2s !important;
}

.nav-cta:hover {
  background: var(--primary-dark) !important;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.nav-toggle span {
  width: 24px;
  height: 2px;
  background: var(--text);
  transition: 0.2s;
}

/* Hero */
.hero {
  padding: 160px 24px 100px;
  text-align: center;
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-alt) 100%);
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text);
}

.hero-tagline {
  font-size: 1.5rem;
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 24px;
}

.hero-description {
  font-size: 1.125rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto 32px;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.btn-lg {
  padding: 18px 36px;
  font-size: 1.125rem;
}

/* Sections */
.section {
  padding: 100px 24px;
}

.section-alt {
  background: var(--bg-alt);
}

.section h2 {
  font-size: 2.25rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 48px;
}

.section-text {
  font-size: 1.125rem;
  color: var(--text-light);
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

/* Features */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.feature-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text);
}

.feature-card p {
  color: var(--text-light);
}

/* CTA Section */
.section-cta {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  text-align: center;
}

.section-cta h2 {
  color: white;
}

.section-cta p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.125rem;
  margin-bottom: 32px;
}

.section-cta .btn-primary {
  background: white;
  color: var(--primary);
}

.section-cta .btn-primary:hover {
  background: var(--bg-alt);
}

/* Footer */
.footer {
  background: var(--text);
  color: white;
  padding: 60px 24px 24px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 48px;
  margin-bottom: 48px;
}

.footer-brand h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.footer-brand p {
  color: rgba(255, 255, 255, 0.6);
}

.footer-contact h4 {
  font-size: 1rem;
  margin-bottom: 16px;
}

.footer-contact a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
}

.footer-contact a:hover {
  color: white;
}

.footer-bottom {
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.875rem;
}

/* Mobile */
@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 24px;
    gap: 16px;
    border-bottom: 1px solid var(--border);
    display: none;
  }

  .nav-links.active {
    display: flex;
  }

  .hero h1 {
    font-size: 2.5rem;
  }

  .hero-tagline {
    font-size: 1.25rem;
  }

  .section {
    padding: 60px 24px;
  }

  .section h2 {
    font-size: 1.75rem;
  }
}`;
}

export function generateJS(): string {
  return `// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
      });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
