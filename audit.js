import lighthouse from 'lighthouse'
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runLighthouseAudit(url) {
	// Extract domain name from URL for filename
	const domain = new URL(url).hostname.replace('www.', '').replace(/\./g, '-')

	const browser = await puppeteer.launch({
		headless: 'new',
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	})

	const page = await browser.newPage()
	const endpoint = browser.wsEndpoint()

	try {
		// Customize which audits to run
		const config = {
			extends: 'lighthouse:default',
			settings: {
				onlyCategories: ['accessibility'], // Only run accessibility audits
				// You can also use: 'performance', 'best-practices', 'seo', 'pwa'
			},
		}

		const runnerResult = await lighthouse(url, {
			port: new URL(endpoint).port,
			output: 'html', // Keep this as just 'html'
			logLevel: 'info',
			config,
		})

		// Create reports directory
		const reportsDir = path.join(__dirname, 'reports')
		if (!fs.existsSync(reportsDir)) {
			fs.mkdirSync(reportsDir)
		}

		// Create date string in YYYY-MM-DD format
		const date = new Date().toISOString().split('T')[0]

		// Create filenames with domain name and date
		const htmlFilename = `${domain}-report-${date}.html`
		const jsonFilename = `${domain}-data-${date}.json`

		// Save HTML report
		fs.writeFileSync(path.join(reportsDir, htmlFilename), runnerResult.report)

		// Save JSON data
		fs.writeFileSync(path.join(reportsDir, jsonFilename), JSON.stringify(runnerResult.lhr, null, 2))

		// Get all accessibility audits
		const accessibilityAudits = runnerResult.lhr.categories.accessibility.auditRefs.map(
			(ref) => runnerResult.lhr.audits[ref.id]
		)

		// Console output
		console.log('\n=== Accessibility Audit Complete ===')
		console.log(`URL: ${url}`)
		console.log(
			`Overall Score: ${(runnerResult.lhr.categories.accessibility.score * 100).toFixed(1)}%`
		)
		console.log(`\nTotal audits: ${accessibilityAudits.length}`)
		console.log(`\nReports saved:`)
		console.log(`1. Full report: ${path.join(reportsDir, htmlFilename)}`)
		console.log(`2. Raw data: ${path.join(reportsDir, jsonFilename)}`)
	} catch (error) {
		console.error('Error running Lighthouse audit:', error)
	} finally {
		await browser.close()
	}
}

// Replace with your target URL
const targetUrl = 'https://claude.ai/new'
runLighthouseAudit(targetUrl)
