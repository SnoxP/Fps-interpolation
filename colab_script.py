# --- BLOCO CONSOLIDADO E CORRIGIDO PARA O COLAB ---
import os
import subprocess
import shutil
import asyncio
import re
import signal
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
subprocess.run("pip install fastapi python-multipart uvicorn pyngrok nest-asyncio scikit-video numpy==1.26.4 tqdm psutil -q", shell=True)
subprocess.run("find /usr/local/lib/python3.*/dist-packages/skvideo/ -type f -name \"*.py\" -exec sed -i 's/np\\.float/float/g; s/np\\.int/int/g' {} +", shell=True)

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pyngrok import ngrok
import psutil
import requests

logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

app = FastAPI()
nest_asyncio.apply()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

NGROK_TOKEN = "35z3EaC3E21BUCaX4vskDObIFjm_2brwJhLzfGxpBNhDZoVcu"
ngrok.set_auth_token(NGROK_TOKEN)

progress_data = {
    "progress": 0,
    "message": "Aguardando...",
    "systemInfo": "Inativo",
    "status": "idle" # idle, processing, paused
}

current_process = None

@app.get("/status")
async def get_status():
    return progress_data

@app.post("/pause")
async def pause_process():
    global current_process, progress_data
    if current_process and current_process.poll() is None:
        try:
            parent = psutil.Process(current_process.pid)
            for child in parent.children(recursive=True):
                child.suspend()
            parent.suspend()
            progress_data["status"] = "paused"
            progress_data["message"] = "Processamento pausado"
            return {"status": "paused"}
        except Exception as e:
            return {"error": str(e)}
    return {"status": "not_running"}

@app.post("/resume")
async def resume_process():
    global current_process, progress_data
    if current_process and current_process.poll() is None:
        try:
            parent = psutil.Process(current_process.pid)
            for child in parent.children(recursive=True):
                child.resume()
            parent.resume()
            progress_data["status"] = "processing"
            progress_data["message"] = "Processando IA (Interpolação)..."
            return {"status": "resumed"}
        except Exception as e:
            return {"error": str(e)}
    return {"status": "not_running"}

@app.post("/cancel")
async def cancel_process():
    global current_process, progress_data
    if current_process and current_process.poll() is None:
        try:
            parent = psutil.Process(current_process.pid)
            for child in parent.children(recursive=True):
                child.kill()
            parent.kill()
            progress_data["status"] = "idle"
            progress_data["message"] = "Cancelado"
            progress_data["progress"] = 0
            return {"status": "cancelled"}
        except Exception as e:
            return {"error": str(e)}
    return {"status": "not_running"}

@app.post("/interpolate")
def interpolate_video(file: UploadFile = File(...), fps: int = Form(60)):
    global progress_data, current_process
    
    if current_process and current_process.poll() is None:
        return {"error": "Outro processo já está em andamento."}

    base_path = '/content/arXiv2020-RIFE'
    os.chdir(base_path)
    raw_upload = "uploaded_file"
    input_video = "input_web.mp4"
    output_audio = "audio_web.aac"
    interpolated_video = "interpolated_web.mp4"
    final_video = "final_web.mp4"

    for f in [raw_upload, input_video, output_audio, interpolated_video, final_video]:
        if os.path.exists(f): os.remove(f)

    progress_data.update({"progress": 0, "message": "Iniciando...", "systemInfo": "Upload concluído", "status": "processing"})
    
    with open(raw_upload, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        if file.filename.lower().endswith('.gif'):
            progress_data.update({"progress": 2, "message": "Convertendo GIF para MP4..."})
            os.system(f'ffmpeg -y -i {raw_upload} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" {input_video} -loglevel quiet')
        else:
            os.system(f'ffmpeg -y -i {raw_upload} -pix_fmt yuv420p {input_video} -loglevel quiet')

        if not os.path.exists(input_video):
            raise Exception("Falha ao ler ou converter o vídeo de entrada.")

        progress_data.update({"progress": 5, "message": "Extraindo áudio..."})
        
        if not file.filename.lower().endswith('.gif'):
            audio_extracted = os.system(f'ffmpeg -y -i {input_video} -vn -acodec copy {output_audio} 2> /dev/null') == 0
        else:
            audio_extracted = False

        exp = 1 
        if fps >= 120:
            exp = 2 

        progress_data.update({"progress": 10, "message": "Processando IA (Interpolação)..."})
        
        cmd = ['python3', 'inference_video.py', f'--exp={exp}', f'--video={input_video}', f'--output={interpolated_video}']
        current_process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        buffer = ""
        while True:
            char = current_process.stdout.read(1)
            if not char:
                if current_process.poll() is not None:
                    break
                continue
            if char in ('\r', '\n'):
                if buffer:
                    match_percent = re.search(r'(\d+)%\|', buffer)
                    match_frames = re.search(r'(\d+/\d+)', buffer)
                    frames_str = match_frames.group(1) if match_frames else ""
                    
                    if match_percent:
                        p_ia = int(match_percent.group(1))
                        progress_data["progress"] = 10 + int(p_ia * 0.8)
                        if progress_data["status"] != "paused":
                            progress_data["systemInfo"] = frames_str
                        print(f"\rProgresso: {progress_data['progress']}% | Frames: {frames_str}", end="", flush=True)
                buffer = ""
            else:
                buffer += char
        current_process.wait()
        
        if progress_data["status"] == "idle":
            return {"error": "Processo cancelado pelo usuário."}

        if not os.path.exists(interpolated_video):
            raise Exception("Ocorreu um erro no RIFE: o vídeo interpolado não foi gerado.")

        progress_data.update({"progress": 92, "message": "Finalizando arquivo de vídeo...", "systemInfo": "Inativo"})
        
        has_audio = audio_extracted and os.path.exists(output_audio) and os.path.getsize(output_audio) > 0
        
        if has_audio:
            os.system(f'ffmpeg -y -i {interpolated_video} -i {output_audio} -c:v libx264 -pix_fmt yuv420p -c:a aac {final_video} -loglevel quiet')
        else:
            os.system(f'ffmpeg -y -i {interpolated_video} -c:v libx264 -pix_fmt yuv420p {final_video} -loglevel quiet')

        if os.path.exists(final_video):
            progress_data.update({"progress": 98, "message": "Enviando para nuvem...", "systemInfo": "Catbox"})
            try:
                with open(final_video, 'rb') as f:
                    response = requests.post('https://litterbox.catbox.moe/user/api.php', data={'reqtype': 'fileupload', 'time': '1h'}, files={'fileToUpload': f})
                if response.status_code == 200:
                    cloud_url = response.text.strip()
                    progress_data.update({"progress": 100, "message": "Concluído!", "systemInfo": "Sucesso", "status": "idle"})
                    return {"url": cloud_url}
            except Exception as e:
                pass
            progress_data.update({"progress": 100, "message": "Concluído!", "systemInfo": "Sucesso", "status": "idle"})
            return FileResponse(final_video, media_type="video/mp4", filename="resultado.mp4")

        return {"error": "Erro na geração do vídeo final"}

    except Exception as e:
        progress_data.update({"progress": 0, "message": f"Erro: {str(e)}", "status": "idle"})
        return {"error": str(e)}

ngrok.kill()
public_url = ngrok.connect(8000).public_url
print(f"\nURL PARA O SITE: {public_url}/interpolate")

config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="warning")
server = uvicorn.Server(config)
loop = asyncio.get_event_loop()
loop.run_until_complete(server.serve())
