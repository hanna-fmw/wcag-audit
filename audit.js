import lighthouse from 'lighthouse'
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runLighthouseAudit(url) {
	const browser = await puppeteer.launch({
		headless: 'new',
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	})

	const page = await browser.newPage()
	const endpoint = browser.wsEndpoint()

	try {
		// Run Lighthouse
		const runnerResult = await lighthouse(url, {
			port: new URL(endpoint).port,
			output: 'html',
			logLevel: 'info',
			onlyCategories: ['accessibility', 'best-practices', 'performance', 'seo'],
		})

		// Create reports directory if it doesn't exist
		const reportsDir = path.join(__dirname, 'reports')
		if (!fs.existsSync(reportsDir)) {
			fs.mkdirSync(reportsDir)
		}

		// Generate timestamp for unique filenames
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

		// Save HTML report
		fs.writeFileSync(
			path.join(reportsDir, `lighthouse-report-${timestamp}.html`),
			runnerResult.report
		)

		// Log scores
		console.log('Lighthouse audit completed successfully!')
		console.log('Performance score:', runnerResult.lhr.categories.performance.score * 100)
		console.log('Accessibility score:', runnerResult.lhr.categories.accessibility.score * 100)
		console.log('Best practices score:', runnerResult.lhr.categories['best-practices'].score * 100)
		console.log('SEO score:', runnerResult.lhr.categories.seo.score * 100)
		console.log(
			`\nReport saved to: ${path.join(reportsDir, `lighthouse-report-${timestamp}.html`)}`
		)
	} catch (error) {
		console.error('Error running Lighthouse audit:', error)
	} finally {
		await browser.close()
	}
}

// Replace with your target URL
const targetUrl = 'https://www.stormfors.com/'
runLighthouseAudit(targetUrl)
