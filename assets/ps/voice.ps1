param([string]$phrase = "p")

# Create SpeechSynthezier instance.
Add-Type -AssemblyName System.speech
$tts = New-Object System.Speech.Synthesis.SpeechSynthesizer

# Setup where the speech file will be rendered.
$newFile = Join-Path -Path $PSScriptRoot -ChildPath .. -Resolve
$newFile += "\hb.wav"
$tts.SetOutputToWaveFile($newFile);

# Render speech file.
$tts.Speak($phrase)