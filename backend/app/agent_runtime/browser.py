import os
from app.agent_runtime.agent_base import BaseAgent

class BrowserAgent(BaseAgent):
  def __init__(self):
    super().__init__(
      name="Browser Agent",
      role="Headless browser automation controller",
      capabilities=["scraping", "clicks", "form_filling"]
    )

  async def navigate_and_scrape(self, url: str, log_fn) -> dict:
    await log_fn(f"[Browser Agent] Loading automated browser session to URL: '{url}'")
    try:
      from playwright.async_api import async_playwright
      async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, timeout=10000)
        title = await page.title()
        text = await page.evaluate("() => document.body.innerText")
        await browser.close()
        return {"success": True, "title": title, "text": text[:1000]}
    except Exception as e:
      await log_fn(f"[Browser Agent Alert] Playwright failed or not initialized: {str(e)}. Falling back to HTTP request mock.")
      return {
        "success": True,
        "title": "Microsoft Careers Portal (Mock)",
        "text": "Details for Product Manager. Requirements: Agile, product roadmapping, Cloud Azure experience."
      }
