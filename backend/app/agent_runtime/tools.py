import datetime
from typing import Dict, Any, List

class ToolRegistry:
  @staticmethod
  def get_all_tools() -> List[Dict[str, Any]]:
    return [
      {
        "id": "tool_search",
        "name": "Bing Web Search",
        "description": "Queries the internet for jobs, certifications, and resources.",
        "permissions": ["network"],
        "capabilities": ["search", "url_discovery"],
        "executionEndpoint": "/api/v1/tools/execute/search"
      },
      {
        "id": "tool_browser",
        "name": "Playwright Browser",
        "description": "Headless web scraper and form automated worker.",
        "permissions": ["network", "browser"],
        "capabilities": ["scraping", "clicks", "screenshots"],
        "executionEndpoint": "/api/v1/tools/execute/browser"
      },
      {
        "id": "tool_docintel",
        "name": "Azure Document Intelligence",
        "description": "OCR document parser that identifies tabular data and key skills.",
        "permissions": ["read_file"],
        "capabilities": ["ocr", "parsing"],
        "executionEndpoint": "/api/v1/tools/execute/docintel"
      },
      {
        "id": "tool_email",
        "name": "Outlook Client",
        "description": "Delivers email reports and notification summaries.",
        "permissions": ["email_send"],
        "capabilities": ["email"],
        "executionEndpoint": "/api/v1/tools/execute/email"
      }
    ]

  @staticmethod
  async def execute_tool(tool_id: str, args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    print(f"[Tool Engine] Executing {tool_id} with args {args} for task {context.get('taskId')}")
    
    if tool_id == "tool_search":
      query = args.get("query", "Product Manager roles")
      return {
        "success": True,
        "data": {
          "query": query,
          "results": [
            { "title": f"Azure AI PM Careers - {query}", "url": "https://careers.microsoft.com", "snippet": "Develop next-gen model routers." },
            { "title": "AIPMM Product School Credentials", "url": "https://aipmm.com", "snippet": "Acquire certified credentials." }
          ]
        }
      }
    elif tool_id == "tool_browser":
      url = args.get("url", "https://careers.microsoft.com")
      # Simulate Playwright action
      return {
        "success": True,
        "data": {
          "url": url,
          "title": "Microsoft Careers Portal",
          "text": "Requirements: 5 years experience. Skills: Cloud scale orchestration, Pydantic, TypeScript.",
          "screenshot_url": f"/captures/shot_{int(datetime.datetime.utcnow().timestamp())}.png"
        }
      }
    elif tool_id == "tool_docintel":
      return {
        "success": True,
        "data": {
          "skills": ["Python", "Azure Functions", "Cosmos DB", "TypeScript"],
          "gaps": ["Roadmapping", "Product Strategy"]
        }
      }
    elif tool_id == "tool_email":
      return {
        "success": True,
        "data": { "sent": True, "recipient": args.get("to") }
      }
    else:
      return {
        "success": False,
        "error": f"Tool {tool_id} not registered."
      }
