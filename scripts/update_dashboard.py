import json, datetime, urllib.request, concurrent.futures, pathlib
P=pathlib.Path("docs/live-data.json")
old=json.loads(P.read_text()) if P.exists() else {"data":{}}
urls={"nba":"https://nba-atlas.vercel.app/api/season","geo":"https://hegemony-world-power.vercel.app/api/tension","power":"https://blackout-global-monitor.vercel.app/api/pulse","outages":"https://blackout-global-monitor.vercel.app/api/outages","science":"https://cosmos-lab-v3.vercel.app/api/radar"}
from zoneinfo import ZoneInfo
localday=datetime.datetime.now(ZoneInfo("Europe/Athens")).date().isoformat()
urls["pax"]="https://pax-peace-monitor.vercel.app/api/news?region=ukraine"
urls["duty"]="https://efimeria-one.vercel.app/api/live-duty?type=hospital&date="+localday+"&area=Thessaloniki"
def fetch(k,u):
    try:
        with urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"BuildLab/2.0","Accept":"application/json"}),timeout=45) as r:
            d=json.load(r)
        if k=="nba": m={"asOf":d["asOf"],"simulations":d["simulations"],"teams":[{"name":t["name"],"champion":t["champion"],"wins":t["projectedWins"]} for t in sorted(d["rows"],key=lambda t:t["champion"],reverse=True)[:5]]}
        elif k=="geo": m={"asOf":d["retrievedAt"],"pairs":[{"name":p["a"]+" / "+p["b"],"score":p.get("score")} for p in d["pairs"]]}
        elif k=="power": m={"asOf":d["fetchedAt"],"headline":d["headline"],"systems":[{"name":s["name"],"score":s.get("score"),"components":s.get("components",[])[:1]} for s in d["systems"] if s["id"] in ("ce","gr")]}
        elif k=="outages": m={"asOf":d["fetchedAt"],"down":d.get("providersDown"),"degraded":d.get("providersDegraded"),"ongoing":sum(bool(x.get("ongoing")) for x in d.get("internet",{}).get("countries",[]))}
        elif k=="pax": m={"asOf":d["updatedAt"],"items":[{f:p.get(f) for f in ("title","url","publishedAt")} for p in d["articles"][:10]]}
        elif k=="duty": m={"asOf":datetime.datetime.now(datetime.timezone.utc).isoformat(),"date":d["date"],"entries":[{f:p.get(f) for f in ("name","hours")} for p in d["entries"]],"liveConfirmed":d.get("liveConfirmed",False)}
        else: m={"asOf":d["asOf"],"count":d["count"],"items":[{f:p.get(f) for f in ("id","title","url","published")} for p in d["items"][:5]]}
        return k,m,True
    except Exception as e:
        print(k,type(e).__name__,str(e)[:200])
        return k,{"error":"Source unavailable"},False
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    results=list(pool.map(lambda item:fetch(*item),urls.items()))
data={}
for k,m,ok in results:
    if not ok and k in old.get("data",{}) and not old["data"][k].get("error"):
        m={**old["data"][k],"stale":True}
    data[k]=m
if not any(ok for k,m,ok in results):
    raise SystemExit("All sources unavailable; retaining last snapshot")
P.write_text(json.dumps({"generatedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),"data":data},ensure_ascii=False,indent=2)+"\n")
