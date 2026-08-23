from fastapi import APIRouter, Depends
from app.utils.database import get_db

router = APIRouter()

WARD_CENTERS = {
    "White Town":   [79.8350,11.9308], "Lawspet":      [79.8267,11.9489],
    "Oulgaret":     [79.8123,11.9567], "Mudaliarpet":  [79.8345,11.9345],
    "Villianur":    [79.8234,11.9123], "Ariyankuppam": [79.7869,11.8745],
    "Bahour":       [79.8012,11.8523], "Mannadipet":   [79.7821,11.9234],
    "Nettapakkam":  [79.7543,11.9456], "Embalam":      [79.7654,11.9012],
}
CATEGORY_EMOJI = {"ROADS":"🚧","WATER":"💧","WASTE":"🗑️","LIGHTING":"💡","AIR_QUALITY":"💨","PARKS":"🌳","PUBLIC_PROPERTY":"🏛️","OTHER":"📌"}
PRIORITY_COLOR = {"LOW":"#4CC88A","MEDIUM":"#FFD060","HIGH":"#E8901A","CRITICAL":"#E85038"}

@router.get("/pins")
async def map_pins(db=Depends(get_db)):
    issues = await db["issues"].find(
        {"status":{"$in":["VERIFIED","IN_PROGRESS","RESOLVED"]}},
        {"title":1,"category":1,"priority":1,"status":1,"location":1,"ward":1,"like_count":1}
    ).limit(500).to_list(500)
    pins = []
    for i in issues:
        coords = i.get("location",{}).get("coordinates",[79.8145,11.9139])
        pins.append({
            "id":str(i["_id"]),
            "lat":coords[1],"lng":coords[0],
            "title":i.get("title","")[:50],
            "category":i.get("category","OTHER"),
            "priority":i.get("priority","MEDIUM"),
            "status":i.get("status","VERIFIED"),
            "ward":i.get("ward",""),
            "emoji":CATEGORY_EMOJI.get(i.get("category","OTHER"),"📌"),
            "color":PRIORITY_COLOR.get(i.get("priority","MEDIUM"),"#FFD060"),
            "likes":i.get("like_count",0),
        })
    return pins

@router.get("/heatmap")
async def heatmap(db=Depends(get_db)):
    issues = await db["issues"].find({"status":{"$in":["VERIFIED","IN_PROGRESS"]}},{"location":1,"priority":1}).to_list(1000)
    weights = {"LOW":0.2,"MEDIUM":0.4,"HIGH":0.7,"CRITICAL":1.0}
    points  = []
    for i in issues:
        c = i.get("location",{}).get("coordinates",[])
        if len(c)==2:
            points.append([c[1],c[0],weights.get(i.get("priority","MEDIUM"),0.4)])
    return points

@router.get("/wards")
async def ward_boundaries(db=Depends(get_db)):
    wards = await db["wards"].find({}).to_list(20)
    result = []
    for w in wards:
        result.append({
            "name":w["name"],"name_ta":w.get("name_ta",""),
            "name_fr":w.get("name_fr",""),
            "health_score":w.get("health_score",100),
            "open_issues":w.get("open_issues",0),
            "center":WARD_CENTERS.get(w["name"],[79.8145,11.9139]),
        })
    return result
