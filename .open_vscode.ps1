$workspace='c:\Users\rikar\OneDrive\Área de Trabalho\nf-system'
try {
    Start-Process code -ArgumentList $workspace
    Write-Output "STARTED:code"
} catch {
    $c1='C:\Program Files\Microsoft VS Code\Code.exe'
    $c2='C:\Program Files (x86)\Microsoft VS Code\Code.exe'
    $c3=Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code\Code.exe'
    if (Test-Path $c1) {
        Start-Process -FilePath $c1 -ArgumentList $workspace
        Write-Output "STARTED:$c1"
    } elseif (Test-Path $c2) {
        Start-Process -FilePath $c2 -ArgumentList $workspace
        Write-Output "STARTED:$c2"
    } elseif (Test-Path $c3) {
        Start-Process -FilePath $c3 -ArgumentList $workspace
        Write-Output "STARTED:$c3"
    } else {
        Write-Output "NOTFOUND"
    }
}
