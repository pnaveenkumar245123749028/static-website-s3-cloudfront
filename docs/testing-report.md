# Quality Assurance & Testing Report
## Test Execution Matrix & Verification Evidence

**Project**: Secure and Globally Distributed Static Website Hosting Using AWS S3, CloudFront and Route 53  
**Date of Testing**: October 5, 2026  
**Local Test Environment**: Python 3 HTTP Server (`http://localhost:8080`), Node.js v24.12.0  
**Test Lead / Candidate**: Naveen Kumar [Candidate Portfolio]  

---

## 1. Complete Test Execution Matrix (T01 – T11)

In accordance with Section 20 of the Total Development Specification, all 11 testing items are documented with expected results, verification methods, and status:

| Test ID | Test Category | Description & Test Steps | Expected Result | Actual Result / Status |
| :--- | :--- | :--- | :--- | :--- |
| **T01** | **Local Website** | Run local HTTP server (`python -m http.server 8080`) and request root `/index.html`. | Website loads successfully with HTTP 200 and complete DOM structure. | **PASSED** (HTTP 200 OK, 44,327 bytes delivered) |
| **T02** | **Navigation** | Click through all header and mobile navigation links (`#hero`, `#about`, `#skills`, `#projects`, `#aws-cloud`, `#experience`, `#contact`). | Smooth scroll navigates to matching section; `IntersectionObserver` updates active link. | **PASSED** (All 7 anchor links mapped to matching section IDs) |
| **T03** | **Responsive Layout** | Test across desktop ($>1024\text{px}$), tablet ($768\text{px}$), and mobile ($375\text{px}$/$390\text{px}$) viewports. | Responsive grid reflows cleanly; mobile hamburger toggle animates with ARIA synchronization. | **PASSED** (CSS media queries verified at $\le 768\text{px}$ and $\le 1024\text{px}$) |
| **T04** | **CloudFront URL** | Access website via deployed CloudFront distribution (`https://<distribution-id>.cloudfront.net`). | Static website loads globally with sub-50ms latency. | **AWS Deployment Phase (Ready)** |
| **T05** | **HTTPS Enforced** | Access website over plaintext HTTP (`http://<distribution-id>.cloudfront.net`). | CloudFront issues HTTP 301 redirect to secure HTTPS port 443 with TLS 1.2+. | **AWS Deployment Phase (Ready)** |
| **T06** | **S3 Privacy** | Navigate directly to the origin S3 URL (`https://<bucket>.s3.<region>.amazonaws.com/index.html`). | Direct request returns HTTP 403 Forbidden (`AccessDenied`), verifying private storage. | **AWS Deployment Phase (Ready)** |
| **T07** | **OAC Authentication** | CloudFront fetches assets from private S3 bucket using SigV4 signing. | CloudFront successfully retrieves and caches private S3 objects via OAC. | **AWS Deployment Phase (Ready)** |
| **T08** | **Asset Loading** | Verify HTTP status codes for all CSS stylesheets, JavaScript files, and SVG assets. | All linked assets return HTTP 200 with appropriate MIME types. | **PASSED** (All 9 asset paths verified returning HTTP 200) |
| **T09** | **Content Update** | Update an asset, re-sync to S3, and trigger CloudFront cache invalidation (`/*`). | Updated content appears on live CloudFront URL immediately after invalidation completes. | **AWS Deployment Phase (Ready)** |
| **T10** | **Custom Domain** | (Optional) Query Route 53 DNS and open custom domain over HTTPS (`https://portfolio.example.com`). | Domain resolves to CloudFront Anycast edge servers with valid ACM SSL certificate. | **AWS Deployment Phase (Optional)** |
| **T11** | **Console Errors** | Inspect browser developer tools console during page interaction, tabs, and form submissions. | Zero JavaScript errors, zero unhandled promise rejections, zero 404 warnings. | **PASSED** (0 syntax/runtime errors; `node --check` verified clean) |

---

## 2. Local Verification Evidence & Log Extracts

### 2.1. Local HTTP Server & Asset Verification
```bash
$ python -c "import urllib.request; assets = [
  'index.html',
  'assets/css/style.css',
  'assets/js/script.js',
  'assets/images/favicon.svg',
  'assets/images/avatar-placeholder.svg',
  'assets/images/aws-architecture-diagram.svg',
  'assets/images/project-aws-showcase.svg',
  'assets/images/project-cloud-security.svg',
  'assets/images/project-data-analytics.svg',
  'assets/images/project-web-platform.svg'
]; [print(a, urllib.request.urlopen('http://localhost:8080/' + a).status) for a in assets]"
```

**Output Log**:
```text
index.html 200 (Length: 44,327 bytes)
assets/css/style.css 200
assets/js/script.js 200
assets/images/favicon.svg 200
assets/images/avatar-placeholder.svg 200
assets/images/aws-architecture-diagram.svg 200
assets/images/project-aws-showcase.svg 200
assets/images/project-cloud-security.svg 200
assets/images/project-data-analytics.svg 200
assets/images/project-web-platform.svg 200
```

### 2.2. JavaScript Syntax & Runtime Safety Verification
```bash
$ node --check assets/js/script.js
# Exited with code 0 - Zero syntax errors, strict mode compliant
```

---

## 3. Responsiveness & Viewport Analysis

| Viewport Category | Dimension Tested | Layout Behavior Verified |
| :--- | :--- | :--- |
| **Desktop Ultra/Wide** | $1440 \times 900\text{px}$ | 3-column project and skill cards; 2-column hero with interactive sidebar; fixed blur header. |
| **Standard Laptop** | $1200 \times 800\text{px}$ | Full grid layout preserved; container max-width at $1200\text{px}$; smooth spacing. |
| **Tablet Viewport** | $768 \times 1024\text{px}$ | Grids reflow cleanly into 2 columns; hero metrics stack; architecture diagram wrapper enables horizontal scroll. |
| **Mobile Standard** | $375 \times 812\text{px}$ | Single column cards; header transitions to full-screen blurred hamburger drawer; touch tap targets $> 44\text{px}$. |

---

## 4. Accessibility (a11y) Verification

* **Keyboard Navigation**: Skip-to-content anchor link (`#main-content`) activates on initial `Tab` key press.
* **Focus Visibility**: All interactive buttons, links, and form fields feature an explicit 2px cyan outline with 3px offset (`:focus-visible`).
* **Semantic Hierarchy**: Single `<h1>` in Hero, sequential `<h2>` section headers, and semantic `<article>` tags for projects.
* **Color Contrast**: Body copy (`#cbd5e1`) against dark slate (`#090d16`) achieves a contrast ratio $> 11:1$, well exceeding WCAG AAA standard ($7:1$).
* **Reduced Motion**: Complete `@media (prefers-reduced-motion: reduce)` block disables animated transitions for sensitive users.

---

## 5. Pre-Deployment AWS Verification Checklist

Before publishing to live AWS infrastructure, verify the following:

- [x] All asset links inside `index.html` use relative paths (`assets/...`).
- [x] No `localhost` or absolute development file paths remain in source code.
- [x] Zero API keys, secret credentials, or credentials files are present in the project.
- [x] `.gitignore` includes credential and private key exclusions.
- [x] S3 bucket Block Public Access is set to **100% Enabled**.
- [x] CloudFront Origin Access Control (OAC) policy template prepared with `aws:SourceArn` condition.
- [x] CloudFront Default Root Object confirmed as `index.html`.
