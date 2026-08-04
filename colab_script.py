# --- BLOCO CONSOLIDADO E CORRIGIDO PARA O COLAB ---
import os
import subprocess
import shutil
import asyncio
import re
import nest_asyncio
import uvicorn
import logging

print("🚀 Iniciando configuração completa...")

if not os.path.exists('/content/arXiv2020-RIFE'):
    print("📂 Clonando repositório RIFE...")
    subprocess.run("git clone https://github.com/hzwer/arXiv2020-RIFE", shell=True)

os.chdir('/content/arXiv2020-RIFE')
os.makedirs('train_log', exist_ok=True)

print("📥 Verificando modelos...")
if not os.path.exists('train_log/flownet.pkl'):
    subprocess.run("gdown --id 1wsQIhHZ3Eg4_AfCXItFKqqyDQlGL-96N -O train_log/flownet.pkl", shell=True)
if not os.path.exists('train_log/RIFE_trained_model_v3.6.zip'):
    subprocess.run("gdown --id 1APIzVeI-4ZZCEuIRE1m6WYfSCaOsi_7_ -O train_log/RIFE_trained_model_v3.6.zip", shell=True)
    subprocess.run("7z e train_log/RIFE_trained_model_v3.6.zip -otrain_log -y", shell=True)

print("📦 Configurando ambiente...")
subprocess.run("pip install fastapi python-multipart uvicorn pyngrok nest-asyncio scikit-video numpy==1.26.4 tqdm -q", shell=True)
subprocess.run("find /usr/local/lib/python3.*/dist-packages/skvideo/ -type f -name \"*.py\" -exec sed -i 's/np\\.float/float/g; s/np\\.int/int/g' {} +", shell=True)

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pyngrok import ngrok

# Desabilitar logs chatos de acesso do Uvicorn para limpar o terminal
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

app = FastAPI()
nest_asyncio.apply()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Token Ngrok (Coloque o seu token aqui se mudar)
NGROK_TOKEN = "35z3EaC3E21BUCaX4vskDObIFjm_2brwJhLzfGxpBNhDZoVcu"
ngrok.set_auth_token(NGROK_TOKEN)

# Variáveis globais para o progresso
progress_data = {
    "progress": 0,
    "message": "Aguardando...",
    "systemInfo": "Inativo"
}

@app.get("/status")
async def get_status():
    return progress_data

@app.post("/interpolate")
def interpolate_video(file: UploadFile = File(...), fps: int = Form(60)):
    global progress_data
    base_path = '/content/arXiv2020-RIFE'
    os.chdir(base_path)

    raw_upload = "uploaded_file"
    input_video = "input_web.mp4"
    output_audio = "audio_web.aac"
    interpolated_video = "interpolated_web.mp4"
    final_video = "final_web.mp4"

    for f in [raw_upload, input_video, output_audio, interpolated_video, final_video]:
        if os.path.exists(f): os.remove(f)

    progress_data.update({"progress": 0, "message": "Iniciando...", "systemInfo": "Upload concluído"})
    print(f"\n📥 Recebido: {file.filename}")

    with open(raw_upload, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Verifica se é GIF ou outro formato que precisa de conversão prévia segura
        if file.filename.lower().endswith('.gif'):
            progress_data.update({"progress": 2, "message": "Convertendo GIF para MP4..."})
            print("🔄 Convertendo GIF para vídeo MP4 base...")
            # Usa ffmpeg para transformar gif num mp4 compatível com o cv2 (RIFE)
            os.system(f'ffmpeg -y -i {raw_upload} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" {input_video} -loglevel quiet')
        else:
            # Garante que é um formato compatível convertendo também
            os.system(f'ffmpeg -y -i {raw_upload} -pix_fmt yuv420p {input_video} -loglevel quiet')

        if not os.path.exists(input_video):
            raise Exception("Falha ao ler ou converter o vídeo de entrada.")

        progress_data.update({"progress": 5, "message": "Extraindo áudio..."})
        print("🔊 Extraindo áudio...")
        # Extrair áudio apenas se não for GIF
        if not file.filename.lower().endswith('.gif'):
            audio_extracted = os.system(f'ffmpeg -y -i {input_video} -vn -acodec copy {output_audio} 2> /dev/null') == 0
        else:
            audio_extracted = False

        # Determinar multiplicador de interpolação baseado no fps solicitado
        # O RIFE usa --exp=1 (2x), --exp=2 (4x), --exp=3 (8x)
        exp = 1 # Padrão 2x
        if fps >= 120:
            exp = 2 # 4x para tentar chegar mais perto do 120fps

        progress_data.update({"progress": 10, "message": "Processando IA (Interpolação)..."})
        print(f"🔄 Interpolando frames (IA) - Multiplicador: {2**exp}x...")
        cmd = ['python3', 'inference_video.py', f'--exp={exp}', f'--video={input_video}', f'--output={interpolated_video}']
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)

        for line in process.stdout:
            match_percent = re.search(r'(\d+)%\|', line)
            match_frames = re.search(r'(\d+/\d+)', line)
            frames_str = match_frames.group(1) if match_frames else ""

            if match_percent:
                p_ia = int(match_percent.group(1))
                progress_data["progress"] = 10 + int(p_ia * 0.8)
                progress_data["systemInfo"] = frames_str
                print(f"\rProgresso: {progress_data['progress']}% | Frames: {frames_str}", end="")

        process.wait()
        print("\n✅ Interpolação finalizada.")
        
        if not os.path.exists(interpolated_video):
            raise Exception("Ocorreu um erro no RIFE: o vídeo interpolado não foi gerado.")

        progress_data.update({"progress": 92, "message": "Finalizando arquivo de vídeo...", "systemInfo": "Inativo"})
        print("📦 Codificando vídeo final...")
        
        # Verificar se o áudio realmente foi gerado e não está vazio
        has_audio = audio_extracted and os.path.exists(output_audio) and os.path.getsize(output_audio) > 0
        
        if has_audio:
            os.system(f'ffmpeg -y -i {interpolated_video} -i {output_audio} -c:v libx264 -pix_fmt yuv420p -c:a aac {final_video} -loglevel quiet')
        else:
            os.system(f'ffmpeg -y -i {interpolated_video} -c:v libx264 -pix_fmt yuv420p {final_video} -loglevel quiet')

        if os.path.exists(final_video):
            progress_data.update({"progress": 100, "message": "Concluído!", "systemInfo": "Sucesso"})
            print("🏁 Processo completo. Enviando arquivo.")
            return FileResponse(final_video, media_type="video/mp4", filename="resultado.mp4")

        return {"error": "Erro na geração do vídeo final"}
    except Exception as e:
        print(f"\n❌ Erro: {str(e)}")
        progress_data.update({"progress": 0, "message": f"Erro: {str(e)}"})
        return {"error": str(e)}

# Iniciar Servidor
ngrok.kill()
public_url = ngrok.connect(8000).public_url
print(f"\nURL PARA O SITE: {public_url}/interpolate")

config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="warning")
server = uvicorn.Server(config)
loop = asyncio.get_event_loop()
loop.run_until_complete(server.serve())
