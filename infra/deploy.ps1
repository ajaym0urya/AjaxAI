# PowerShell Deployment Script for AjaxAI Azure Infrastructure

param(
    [string]$ResourceGroupName = "rg-ajaxai-prod",
    [string]$Location = "eastus"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "        Deploying AjaxAI Cloud Infrastructure" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# 1. Login check
Write-Host "Checking Azure Login..."
$azAccount = Get-AzContext
if ($null -eq $azAccount) {
    Write-Host "Azure account not found. Initiating Azure login..." -ForegroundColor Yellow
    Connect-AzAccount
}

# 2. Resource Group check/create
Write-Host "Verifying Resource Group '$ResourceGroupName'..."
$rg = Get-AzResourceGroup -Name $ResourceGroupName -ErrorAction SilentlyContinue
if ($null -eq $rg) {
    Write-Host "Resource Group not found. Creating in location '$Location'..." -ForegroundColor Green
    New-AzResourceGroup -Name $ResourceGroupName -Location $Location
}

# 3. Bicep deployment execution
Write-Host "Deploying infra/main.bicep template..." -ForegroundColor Green
$templateFile = Join-Path $PSScriptRoot "main.bicep"
$deployment = New-AzResourceGroupDeployment `
    -ResourceGroupName $ResourceGroupName `
    -TemplateFile $templateFile `
    -Verbose

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "------------------------------------------------"
Write-Host "ACR Login Server   : " $deployment.Outputs.acrLoginServer.Value
Write-Host "Container Env Name : " $deployment.Outputs.containerAppsEnvironmentName.Value
Write-Host "Cosmos DB Endpoint : " $deployment.Outputs.cosmosEndpoint.Value
Write-Host "Key Vault Name     : " $deployment.Outputs.keyVaultName.Value
Write-Host "Service Bus Name   : " $deployment.Outputs.serviceBusNamespaceName.Value
Write-Host "------------------------------------------------"
