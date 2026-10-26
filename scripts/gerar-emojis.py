"""Copia para public/emoji/ as imagens Fluent Emoji 3D (Microsoft, licença MIT) dos emojis usados no app.

Uso (uma vez, ou quando aparecer um emoji novo no código):
  npm i --no-save @lobehub/fluent-emoji-3d
  python3 scripts/gerar-emojis.py

Gera:
  public/emoji/<codigo>.webp      as imagens (256 px)
  public/emoji/lista.js           a lista que o service worker guarda para uso sem internet
  src/components/Emoji/mapa.ts    emoji -> arquivo
"""
import json, pathlib, re, shutil, sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "node_modules/@lobehub/fluent-emoji-3d/assets"
FONTES = [RAIZ / "src/components/Prancha", RAIZ / "src/components/TecladoGrande"]

# sequências de emoji: pictograma + modificadores, variação (FE0F), juntas (ZWJ) e teclas (20E3)
PADRAO = re.compile(
    r"(?:[\U0001F000-\U0001FAFF☀-➿⬀-⯿⌀-⏿←-⇿℀-⅏]"
    r"[️\U0001F3FB-\U0001F3FF⃣]*"
    r"(?:‍[\U0001F000-\U0001FAFF☀-➿⬀-⯿][️\U0001F3FB-\U0001F3FF]*)*)"
)
IGNORAR = {"✎", "➜", "⌂", "⌨", "↔", "›", "✓", "✕", "→", "⌫"}  # símbolos de texto, não figuras

def codigo(seq, com_fe0f=True):
    pts = [f"{ord(c):x}" for c in seq if com_fe0f or ord(c) != 0xFE0F]
    return "-".join(pts)

if not ORIGEM.exists():
    sys.exit("Instale antes: npm i --no-save @lobehub/fluent-emoji-3d")

achados = set()
for pasta in FONTES:
    for f in pasta.glob("*.ts*"):
        achados.update(m.group(0) for m in PADRAO.finditer(f.read_text(encoding="utf-8")))
achados -= IGNORAR

destino = RAIZ / "public/emoji"
destino.mkdir(parents=True, exist_ok=True)
mapa, faltando = {}, []
for e in sorted(achados):
    for nome in (codigo(e), codigo(e, False), codigo(e) + "-fe0f"):
        arq = ORIGEM / f"{nome}.webp"
        if arq.exists():
            shutil.copyfile(arq, destino / arq.name)
            mapa[e] = arq.name
            # a mesma figura com e sem o seletor de variação
            mapa[e.replace("️", "")] = arq.name
            break
    else:
        faltando.append(e)

arquivos = sorted(set(mapa.values()))
(destino / "lista.js").write_text(
    "// Gerado por scripts/gerar-emojis.py\nself.EMOJIS = " + json.dumps(["/emoji/" + a for a in arquivos]) + ";\n",
    encoding="utf-8")
(RAIZ / "src/components/Emoji/mapa.ts").write_text(
    "// Gerado por scripts/gerar-emojis.py. Fluent Emoji 3D, da Microsoft (licença MIT).\n"
    "export const MAPA_EMOJI: Record<string, string> = " + json.dumps(mapa, ensure_ascii=False, indent=1, sort_keys=True) + ";\n",
    encoding="utf-8")
print(f"{len(arquivos)} imagens copiadas")
if faltando:
    print("sem imagem (ficam como emoji do aparelho):", " ".join(faltando))
