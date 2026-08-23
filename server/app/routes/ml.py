from fastapi import APIRouter
import random

router = APIRouter()

CATS = ["ROADS","WATER","WASTE","LIGHTING","AIR_QUALITY","PARKS","PUBLIC_PROPERTY","OTHER"]
PRIS = ["LOW","MEDIUM","HIGH","CRITICAL"]

KEYWORDS = {"road":("ROADS","HIGH"),"pothole":("ROADS","HIGH"),"water":("WATER","HIGH"),"pipe":("WATER","MEDIUM"),"waste":("WASTE","MEDIUM"),"garbage":("WASTE","HIGH"),"light":("LIGHTING","MEDIUM"),"dark":("LIGHTING","HIGH"),"air":("AIR_QUALITY","MEDIUM"),"smoke":("AIR_QUALITY","HIGH"),"park":("PARKS","LOW"),"tree":("PARKS","LOW")}

@router.post("/classify-text")
async def classify_text(body:dict):
    text = (body.get("title","")+" "+body.get("description","")).lower()
    cat,pri = "OTHER","MEDIUM"
    for kw,(c,p) in KEYWORDS.items():
        if kw in text: cat=c; pri=p; break
    conf = round(random.uniform(0.72,0.97),2)
    return {"category":cat,"priority":pri,"confidence":conf,"tags":[cat.lower()]}

@router.post("/priority-score")
async def priority_score(body:dict):
    area_weights = {"HIGHWAY":30,"SCHOOL_HOSPITAL":28,"COMMERCIAL":25,"INDUSTRIAL":20,"RESIDENTIAL":15,"RURAL":10}
    hectic_weights = {"EXTREMELY_BUSY":30,"BUSY":22,"MODERATE":15,"LOW":8,"VERY_LOW":3}
    img_score  = round(random.uniform(10,40),1)
    loc_score  = area_weights.get(body.get("area_type","RESIDENTIAL"),15)
    hec_score  = hectic_weights.get(body.get("hectic_level","MODERATE"),15)
    total      = img_score*0.4 + loc_score*0.3 + hec_score*0.3
    if total>=76: pri="CRITICAL"
    elif total>=51: pri="HIGH"
    elif total>=26: pri="MEDIUM"
    else: pri="LOW"
    return {"priority":pri,"total_score":round(total,1),"image_score":img_score,"location_score":loc_score,"hectic_score":hec_score}

@router.post("/chatbot")
async def chatbot(body:dict):
    text = body.get("message","").lower()
    responses = {
        "report":{"intent":"report_issue","response":"To report an issue, click the + button on the feed page. Upload a photo, drop a pin on the map, and choose public or anonymous reporting."},
        "anonymous":{"intent":"anonymous_reporting","response":"Anonymous reporting hides your identity completely. You get a 6-digit tracking code to follow your issue. No EcoScore is awarded for anonymous reports."},
        "eco":{"intent":"ecoscore","response":"EcoScore rewards you for civic participation. Earn points for reporting (10pts), getting verified (20pts), and resolution (50pts). Reach Eco Champion at 3000+ points!"},
        "status":{"intent":"check_status","response":"You can track your issue on the issue detail page or use your anonymous tracking code at the Track page."},
        "ngo":{"intent":"ngo_info","response":"NGOs verify reports before they go public. Only the ward-specific NGO can approve issues from that ward, ensuring quality and local knowledge."},
    }
    for kw,resp in responses.items():
        if kw in text: return resp
    return {"intent":"general_help","response":"I can help you report civic issues, track your reports, learn about EcoScore, or find ward information. What would you like to know?"}
