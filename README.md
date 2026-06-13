# Rumbam Engineers Limited — Website

Professional website for **Rumbam Engineers Limited (REL)**, a 100% Papua New Guinea–owned civil engineering consulting firm established in 1994.

---

## Pages

| Page | File | Description |
|---|---|---|
| Home | `index.html` | Hero, stats, services overview, featured projects, CTA |
| About Us | `about.html` | Company story, mission/vision, values, why REL |
| Services | `services.html` | All 5 engineering disciplines with detail cards |
| Projects | `projects.html` | Portfolio with category filter bar |
| Our Team | `team.html` | Leadership team and engineering staff |
| Contact | `contact.html` | Contact form, office info, map placeholder |

## Tech Stack

- Pure HTML5, CSS3, Vanilla JavaScript — no frameworks or build tools required
- [Font Awesome 6.5](https://fontawesome.com) — icons via CDN
- [Google Fonts](https://fonts.google.com) — Inter + Barlow Condensed via CDN

## Brand Colors

| Role | Hex |
|---|---|
| Primary (cobalt blue) | `#0044BB` |
| Dark navy | `#1A2E54` |
| Steel blue | `#5B78B0` |
| Accent (sky blue) | `#0EA5E9` |
| Accent dark | `#0284C7` |

## File Structure

```
rumbam-website/
├── index.html
├── about.html
├── services.html
├── projects.html
├── team.html
├── contact.html
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── main.js
    └── images/          ← add project/team photos here
```

## Deployment

### GitHub Pages (free)

1. Go to **Settings → Pages** in this repository
2. Set source to **Deploy from a branch → main → / (root)**
3. Save — the site will be live at `https://normzeribk-del.github.io/REL-Website-Upgrade/`

### Custom Domain (rumbamengineers.com)

1. Enable GitHub Pages as above
2. In **Settings → Pages → Custom domain**, enter `rumbamengineers.com` and save
3. At your domain registrar, add these DNS records:

```
Type    Name    Value
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     normzeribk-del.github.io
```

4. Wait 24–48 hours for DNS propagation — HTTPS is provisioned automatically by GitHub.

## Customisation Notes

- **Team photos** — place images in `assets/images/` and replace the `<i class="fas fa-user-tie">` icon placeholders in `team.html` with `<img>` tags
- **Project photos** — same approach in `projects.html` — replace the icon placeholders in `.project-image-inner` divs
- **Google Maps embed** — in `contact.html`, replace the `.map-placeholder` div with a real `<iframe>` embed from Google Maps
- **Contact form backend** — the form currently shows a success message after a timeout simulation. Wire it to a real backend using [FormSubmit](https://formsubmit.co) (free, no server needed) or EmailJS

### FormSubmit (quickest option — no server required)

Replace the `<form>` tag in `contact.html`:

```html
<form action="https://formsubmit.co/info@rumbamengineers.com" method="POST">
```

And remove the JavaScript form handler from `main.js`.

## Contact

**Rumbam Engineers Limited**
Port Moresby, Papua New Guinea
Phone: +675 323 2082
Email: info@rumbamengineers.com
