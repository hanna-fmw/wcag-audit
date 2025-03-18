# WCAG Audit Tool

A tool for running automated accessibility audits using Lighthouse.

## Setup

1. Clone the repository
2. Run `npm install`

## Usage

1. Open `audit.js`
2. Change the `targetUrl` to the website you want to audit
3. Run `node audit.js`
4. Find the results in the `reports` folder

## Reports

The tool generates HTML reports with timestamps in the `reports` folder. Each report includes:

- Performance score
- Accessibility score
- Best practices score
- SEO score
