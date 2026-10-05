/**
 * Secure & Globally Distributed Static Website
 * Vanilla JavaScript UI Behavior & Architecture Interactive Components
 * Pure Vanilla JS - Zero External Runtime Dependencies
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Theme Toggle (Dark / Light)
  // --------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');

  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'light') {
      themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`;
    } else {
      themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
      updateThemeIcon(nextTheme);
    });
  }

  // --------------------------------------------------------------------------
  // 2. Responsive Mobile Navigation
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  function toggleMobileMenu(open) {
    const isOpen = open !== undefined ? open : !navMenu.classList.contains('open');
    navMenu.classList.toggle('open', isOpen);
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => toggleMobileMenu());

    // Close on nav link click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
          toggleMobileMenu(false);
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        toggleMobileMenu(false);
        mobileToggle.focus();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 3. Active Navigation Spy (IntersectionObserver)
  // --------------------------------------------------------------------------
  const observedSections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && observedSections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    observedSections.forEach((section) => navObserver.observe(section));
  }

  // --------------------------------------------------------------------------
  // 4. Interactive AWS Architecture Step Selector
  // --------------------------------------------------------------------------
  const stepData = {
    1: {
      title: 'Route 53 DNS Resolution',
      summary: 'Handles global low-latency domain name resolution using AWS Anycast network.',
      details: [
        'Custom domain maps directly to CloudFront using an <strong>Alias (A) record</strong>.',
        'Zero query charges when routing queries to AWS CloudFront distributions.',
        'Seamless health checks and failover routing capabilities.'
      ],
      code: `; Route 53 DNS Record Configuration\nportfolio.example.com.   A   ALIAS   d111111abcdef8.cloudfront.net.\n; TargetHostedZoneId: Z2FDTNDATAQYW2 (CloudFront Fixed Zone ID)`
    },
    2: {
      title: 'Amazon CloudFront Edge Delivery',
      summary: 'Distributes cached content across 400+ Edge Points of Presence globally with HTTPS termination.',
      details: [
        'Default Root Object set to <strong>index.html</strong>.',
        'Viewer Protocol Policy: <strong>Redirect HTTP to HTTPS</strong>.',
        'Leverages <strong>CachingOptimized</strong> cache policy with gzip and brotli compression.',
        'Global edge latency consistently under 50ms.'
      ],
      code: `ViewerProtocolPolicy: redirect-to-https\nDefaultRootObject: index.html\nCachePolicy: 658327ea-f89d-4fab-a63d-7e88639e58f6 (CachingOptimized)\nCompressObjects: true`
    },
    3: {
      title: 'Origin Access Control (OAC) Authentication',
      summary: 'Signs requests to Amazon S3 using AWS Signature Version 4 (SigV4) for zero-trust origin security.',
      details: [
        'Replaces legacy Origin Access Identity (OAI) with modern <strong>SigV4 authentication</strong>.',
        'Supports S3 SSE-KMS encryption and all standard AWS regions.',
        'Blocks direct public traversal to S3; only authenticated CloudFront distributions can read.'
      ],
      code: `OriginAccessControlConfig:\n  Name: "s3-portfolio-oac"\n  OriginAccessControlOriginType: "s3"\n  SigningBehavior: "always"\n  SigningProtocol: "sigv4"`
    },
    4: {
      title: 'Private Amazon S3 Origin Storage',
      summary: 'Stores all static HTML, CSS, JavaScript, and image assets in a fully private bucket.',
      details: [
        '<strong>Block Public Access is 100% enabled</strong> on the bucket.',
        'Bucket policy strictly restricts <code>s3:GetObject</code> to CloudFront via <code>aws:SourceArn</code>.',
        'Zero accidental public data leakage or exposed endpoints.'
      ],
      code: `{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Sid": "AllowCloudFrontServicePrincipalReadOnly",\n    "Effect": "Allow",\n    "Principal": { "Service": "cloudfront.amazonaws.com" },\n    "Action": "s3:GetObject",\n    "Resource": "arn:aws:s3:::<your-bucket-name>/*",\n    "Condition": {\n      "StringEquals": {\n        "AWS:SourceArn": "arn:aws:cloudfront::<account-id>:distribution/<dist-id>"\n      }\n    }\n  }]\n}`
    },
    5: {
      title: 'AWS Certificate Manager (ACM) SSL/TLS',
      summary: 'Provides free, auto-renewing public SSL/TLS certificates for custom domains.',
      details: [
        'Certificate must be requested in the <strong>us-east-1 (N. Virginia)</strong> region for CloudFront.',
        'Enforces TLS 1.2+ modern cipher security for viewers.',
        'Automatic DNS validation with Route 53.'
      ],
      code: `CertificateRegion: us-east-1\nValidationMethod: DNS\nMinimumProtocolVersion: TLSv1.2_2021\nSSLSupportMethod: sni-only`
    }
  };

  const stepCards = document.querySelectorAll('.arch-step-card');
  const detailTitle = document.getElementById('arch-detail-title');
  const detailSummary = document.getElementById('arch-detail-summary');
  const detailList = document.getElementById('arch-detail-list');
  const detailCode = document.getElementById('arch-detail-code');

  function renderArchStep(stepNum) {
    const data = stepData[stepNum];
    if (!data) return;

    stepCards.forEach((card) => {
      const cardStep = card.getAttribute('data-step');
      card.classList.toggle('active', cardStep === String(stepNum));
    });

    if (detailTitle) detailTitle.textContent = data.title;
    if (detailSummary) detailSummary.textContent = data.summary;
    if (detailList) {
      detailList.innerHTML = data.details
        .map((item) => `<li><span class="icon-check">✔</span><span>${item}</span></li>`)
        .join('');
    }
    if (detailCode) detailCode.textContent = data.code;
  }

  stepCards.forEach((card) => {
    card.addEventListener('click', () => {
      const step = card.getAttribute('data-step');
      renderArchStep(step);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Project Filter Tabs
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter || category.includes(filter)) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 6. Safe Contact Form (Client Validation + Mailto Action)
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const subject = document.getElementById('contact-subject').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      // Basic validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name || !email || !message) {
        showStatus('Please complete all required fields.', 'error');
        return;
      }

      if (!emailRegex.test(email)) {
        showStatus('Please provide a valid email address.', 'error');
        return;
      }

      // Safe mailto trigger
      const mailtoUrl = `mailto:naveenkumar.workmail@gmail.com?subject=${encodeURIComponent(
        subject || 'Portfolio Inquiry from ' + name
      )}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

      showStatus(
        'Thank you! Opening your email client to dispatch the message securely (No fake backend used).',
        'success'
      );

      // Open mailto link
      window.location.href = mailtoUrl;

      // Reset form after short delay
      setTimeout(() => {
        contactForm.reset();
      }, 1500);
    });

    function showStatus(text, type) {
      formStatus.textContent = text;
      formStatus.className = `form-status-alert ${type}`;
      formStatus.style.display = 'block';
    }
  }

  // --------------------------------------------------------------------------
  // 7. Back to Top Smooth Scroll
  // --------------------------------------------------------------------------
  const backToTopBtn = document.getElementById('back-to-top');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --------------------------------------------------------------------------
  // 8. Initialization
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderArchStep(1); // initialize interactive architecture panel
  });
})();
