Write-Host "Installing backend dependencies..."
Set-Location backend
npm install
Set-Location ..
Write-Host "Installing frontend dependencies..."
Set-Location frontend
npm install
Set-Location ..
Write-Host "Done! Run start.ps1 to launch the app."
