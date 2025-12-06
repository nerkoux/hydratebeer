import { Command } from "commander";
import fetch from "node-fetch";
import chalk from "chalk";
import express, { Request, Response } from "express";
import open from "open";
import prompts from "prompts";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import * as fs from "fs";
import * as path from "path";

interface Config {
  projectId: string;
  passwordHash: string;
  tinybirdToken: string;
  tinybirdRegion?: string;
  endpoint?: string;
}

function loadConfig(): Config | null {
  const cwd = process.cwd();
  const configPaths = [
    path.join(cwd, "hydrate-beer.config.ts"),
    path.join(cwd, "hydrate-beer.config.js"),
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      const projectIdMatch = content.match(/projectId:\s*["']([^"']+)["']/);
      const passwordHashMatch = content.match(/passwordHash:\s*["']([^"']+)["']/);
      const tokenMatch = content.match(/tinybirdToken:\s*["']([^"']+)["']/);
      const regionMatch = content.match(/tinybirdRegion:\s*["']([^"']+)["']/);
      
      if (projectIdMatch && passwordHashMatch && tokenMatch) {
        return { 
          projectId: projectIdMatch[1],
          passwordHash: passwordHashMatch[1],
          tinybirdToken: tokenMatch[1],
          tinybirdRegion: regionMatch ? regionMatch[1] : "us-east"
        };
      }
    }
  }

  return null;
}

async function fetchTinybirdData(pipe: string, params: Record<string, any>, token: string, region: string) {
  const queryString = new URLSearchParams(params).toString();
  const baseUrl = "https://api." + region + ".tinybird.co/v0/pipes";
  const url = baseUrl + "/" + pipe + ".json?" + queryString;
  
  const response = await fetch(url, {
    headers: {
      "Authorization": "Bearer " + token,
    },
  });
  
  if (!response.ok) {
    throw new Error("Tinybird API error: " + response.statusText);
  }
  
  return response.json();
}

function createDashboardHTML(projectId: string, sessionToken: string) {
  return "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>HydrateBeer Monitor - " + projectId + "</title><style>* { margin: 0; padding: 0; box-sizing: border-box; }body {font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;background: #0a0a0a;color: #e5e5e5;padding: 2rem;}.session-timeout {position: fixed;top: 0;left: 0;right: 0;bottom: 0;background: rgba(0, 0, 0, 0.95);display: none;align-items: center;justify-content: center;z-index: 1000;}.session-timeout.active {display: flex;}.timeout-dialog {background: #171717;border: 1px solid #262626;border-radius: 12px;padding: 2rem;max-width: 400px;text-align: center;}.timeout-dialog h2 {margin-bottom: 1rem;color: #ef4444;}.timeout-dialog input {width: 100%;padding: 0.75rem;background: #0a0a0a;border: 1px solid #262626;border-radius: 6px;color: #e5e5e5;font-size: 1rem;margin: 1rem 0;}.timeout-dialog button {width: 100%;padding: 0.75rem;background: #3b82f6;border: none;border-radius: 6px;color: white;font-size: 1rem;cursor: pointer;font-weight: 500;}.timeout-dialog button:hover {background: #2563eb;}.header {display: flex;align-items: center;gap: 1rem;margin-bottom: 2rem;padding-bottom: 1rem;border-bottom: 1px solid #262626;}.logo { font-size: 2rem; }h1 { font-size: 1.5rem; font-weight: 600; }.project-id { color: #737373; font-size: 0.875rem; }.live-indicator {display: flex;align-items: center;gap: 0.5rem;margin-left: auto;font-size: 0.875rem;color: #737373;}.live-dot {width: 8px;height: 8px;background: #22c55e;border-radius: 50%;animation: pulse 2s infinite;}@keyframes pulse {0%, 100% { opacity: 1; }50% { opacity: 0.5; }}.stats-grid {display: grid;grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));gap: 1rem;margin-bottom: 2rem;}.stat-card {background: #171717;border: 1px solid #262626;border-radius: 8px;padding: 1.5rem;}.stat-label {color: #737373;font-size: 0.875rem;margin-bottom: 0.5rem;}.stat-value {font-size: 2rem;font-weight: 700;margin-bottom: 0.25rem;}.stat-trend {color: #22c55e;font-size: 0.75rem;}.events-section {background: #171717;border: 1px solid #262626;border-radius: 8px;padding: 1.5rem;}.section-title {font-size: 1.125rem;font-weight: 600;margin-bottom: 1rem;}.event-row {display: flex;align-items: center;gap: 1rem;padding: 0.75rem;background: #0a0a0a;border-radius: 6px;margin-bottom: 0.5rem;}.event-type {padding: 0.25rem 0.5rem;border-radius: 4px;font-size: 0.75rem;font-weight: 500;}.event-type.hydration { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }.event-type.render { background: rgba(34, 197, 94, 0.1); color: #4ade80; }.event-type.custom { background: rgba(168, 85, 247, 0.1); color: #a78bfa; }.event-type.navigation { background: rgba(249, 115, 22, 0.1); color: #fb923c; }.error { color: #ef4444; text-align: center; padding: 2rem; }</style></head><body><div class=\"session-timeout\" id=\"sessionTimeout\"><div class=\"timeout-dialog\"><h2>⏱️ Session Timeout</h2><p>Your session has expired due to inactivity. Please re-enter your password.</p><input type=\"password\" id=\"timeoutPassword\" placeholder=\"Enter password\"><button onclick=\"verifyPassword()\">Unlock</button></div></div><div class=\"header\"><div class=\"logo\">🍺</div><div><h1>HydrateBeer Monitor</h1><div class=\"project-id\">" + projectId + "</div></div><div class=\"live-indicator\"><div class=\"live-dot\"></div><span>Live</span></div></div><div class=\"stats-grid\"><div class=\"stat-card\"><div class=\"stat-label\">Total Events</div><div class=\"stat-value\" id=\"total-events\">--</div><div class=\"stat-trend\">Loading...</div></div><div class=\"stat-card\"><div class=\"stat-label\">Active Sessions</div><div class=\"stat-value\" id=\"active-sessions\">--</div><div class=\"stat-trend\">Loading...</div></div><div class=\"stat-card\"><div class=\"stat-label\">Avg Hydration</div><div class=\"stat-value\" id=\"avg-hydration\">--</div><div class=\"stat-trend\">Loading...</div></div><div class=\"stat-card\"><div class=\"stat-label\">Slow Renders</div><div class=\"stat-value\" id=\"slow-renders\">--</div><div class=\"stat-trend\">Loading...</div></div></div><div class=\"events-section\"><div class=\"section-title\">Recent Events</div><div id=\"events-list\"><div style=\"text-align: center; color: #737373; padding: 2rem;\">Loading events...</div></div></div><script>const projectId = \"" + projectId + "\";let sessionToken = \"" + sessionToken + "\";let lastActivity = Date.now();const TIMEOUT_DURATION = 5 * 60 * 1000;function resetActivity() {lastActivity = Date.now();}function checkSession() {if (Date.now() - lastActivity > TIMEOUT_DURATION) {document.getElementById('sessionTimeout').classList.add('active');}}async function verifyPassword() {const password = document.getElementById('timeoutPassword').value;try {const response = await fetch('/api/verify-password', {method: 'POST',headers: { 'Content-Type': 'application/json' },body: JSON.stringify({ password: password, sessionToken: sessionToken })});if (response.ok) {const data = await response.json();sessionToken = data.sessionToken;document.getElementById('sessionTimeout').classList.remove('active');document.getElementById('timeoutPassword').value = '';resetActivity();} else {alert('Incorrect password');}} catch (error) {alert('Failed to verify password');}}['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {document.addEventListener(event, resetActivity);});setInterval(checkSession, 10000);async function fetchData() {try {const response = await fetch('/api/data', {headers: { 'X-Session-Token': sessionToken }});if (response.status === 401) {document.getElementById('sessionTimeout').classList.add('active');return;}const data = await response.json();if (data.error) {document.getElementById('events-list').innerHTML = '<div class=\"error\">Error: ' + data.error + '</div>';return;}document.getElementById('total-events').textContent = (data.overview?.total_events || 0).toLocaleString();document.getElementById('active-sessions').textContent = data.overview?.total_sessions || 0;document.getElementById('avg-hydration').textContent = Math.round(data.overview?.avg_hydration || 0) + 'ms';document.getElementById('slow-renders').textContent = data.overview?.slow_renders || 0;if (data.realtimeEvents?.data?.length > 0) {document.getElementById('events-list').innerHTML = data.realtimeEvents.data.map(event => {return '<div class=\"event-row\"><span class=\"event-type ' + event.eventType + '\">' + event.eventType + '</span><span style=\"flex: 1; color: #a3a3a3;\">' + event.route + '</span><span style=\"color: #737373;\">' + event.duration + 'ms</span></div>';}).join('');} else {document.getElementById('events-list').innerHTML = '<div style=\"text-align: center; color: #737373; padding: 2rem;\">No events yet</div>';}} catch (error) {console.error('Failed to fetch data:', error);document.getElementById('events-list').innerHTML = '<div class=\"error\">Failed to connect</div>';}}fetchData();setInterval(fetchData, 5000);</script></body></html>";
}

export async function monitorCommand() {
  console.log(chalk.blue("\n🍺 Starting HydrateBeer Monitor...\n"));

  const config = loadConfig();
  if (!config) {
    console.log(chalk.red("✖ No configuration found"));
    console.log(chalk.gray("  Run 'npx hydrate-beer init' first\n"));
    process.exit(1);
  }

  const passwordResp = await prompts({
    type: "password",
    name: "password",
    message: "Enter your monitoring password:",
  });

  if (!passwordResp.password) {
    console.log(chalk.yellow("\n✖ Authentication cancelled\n"));
    process.exit(0);
  }

  const isValidPassword = bcrypt.compareSync(passwordResp.password, config.passwordHash);
  
  if (!isValidPassword) {
    console.log(chalk.red("\n✖ Incorrect password\n"));
    process.exit(1);
  }

  const sessionToken = randomBytes(32).toString("hex");
  const sessions = new Map();
  sessions.set(sessionToken, { passwordHash: config.passwordHash, createdAt: Date.now() });

  const app = express();
  app.use(express.json());
  const PORT = 3500;

  app.get("/", (req: Request, res: Response) => {
    res.send(createDashboardHTML(config.projectId, sessionToken));
  });

  app.post("/api/verify-password", (req: Request, res: Response) => {
    const password = req.body.password;
    const oldToken = req.body.sessionToken;
    
    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    const isValid = bcrypt.compareSync(password, config.passwordHash);
    
    if (isValid) {
      const newToken = randomBytes(32).toString("hex");
      sessions.delete(oldToken);
      sessions.set(newToken, { passwordHash: config.passwordHash, createdAt: Date.now() });
      res.json({ sessionToken: newToken });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  app.get("/api/data", async (req: Request, res: Response) => {
    const sessionToken = req.headers["x-session-token"] as string;
    
    if (!sessionToken || !sessions.has(sessionToken)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const overview = await fetchTinybirdData("overview", { projectId: config.projectId }, config.tinybirdToken, config.tinybirdRegion || "us-east");
      const realtimeEvents = await fetchTinybirdData("realtime_metrics", { projectId: config.projectId, limit: 10 }, config.tinybirdToken, config.tinybirdRegion || "us-east");

      res.json({ overview: overview.data?.[0], realtimeEvents: realtimeEvents });
    } catch (error: any) {
      console.error(chalk.red("Tinybird API error:"), error.message);
      res.json({ error: error.message });
    }
  });

  app.listen(PORT, () => {
    const url = "http://localhost:" + PORT;
    console.log(chalk.green("✔ Monitor started"));
    console.log(chalk.gray("  Project: " + config.projectId));
    console.log(chalk.gray("  URL: " + url + "\n"));
    console.log(chalk.blue("  Opening in browser...\n"));
    
    open(url);
  });
}
