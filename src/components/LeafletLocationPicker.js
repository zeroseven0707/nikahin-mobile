/**
 * LeafletLocationPicker
 * Peta interaktif Leaflet + search Nominatim (gratis, no API key).
 *
 * Props:
 *   latitude        {string}   koordinat awal (opsional)
 *   longitude       {string}   koordinat awal (opsional)
 *   onLocationSelect {fn}      callback({ lat, lng, displayName })
 *   height          {number}   tinggi peta px (default 320)
 *   scrollRef       {ref}      ref ke ScrollView parent — untuk lock scroll saat drag peta
 */
import React, { useRef, useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const DEFAULT_LAT  = -6.2088;
const DEFAULT_LNG  = 106.8456;
const DEFAULT_ZOOM = 13;

const buildHtml = (initLat, initLng) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,sans-serif;-webkit-tap-highlight-color:transparent}
  html,body{width:100%;height:100%;background:#f0f2f5;overflow:hidden}

  /* ── Search bar ── */
  #sw{position:absolute;top:10px;left:10px;right:10px;z-index:1000}
  #si{
    width:100%;padding:11px 38px 11px 14px;
    border:2px solid #6b4ce6;border-radius:12px;
    background:#fff;font-size:14px;color:#1a1a2e;
    box-shadow:0 4px 20px rgba(107,76,230,.2);outline:none;
  }
  #si::placeholder{color:#9ca3af}
  #sc{
    position:absolute;right:10px;top:50%;transform:translateY(-50%);
    background:none;border:none;cursor:pointer;
    font-size:16px;color:#9ca3af;display:none;padding:2px 4px;
  }
  #rl{
    position:absolute;top:50px;left:0;right:0;
    background:#fff;border-radius:12px;overflow:hidden;
    box-shadow:0 8px 28px rgba(0,0,0,.14);max-height:220px;overflow-y:auto;
    display:none;
  }
  .ri{
    padding:11px 14px;border-bottom:1px solid #f3f4f6;
    cursor:pointer;font-size:13px;color:#374151;
    display:flex;align-items:flex-start;gap:8px;
  }
  .ri:last-child{border-bottom:none}
  .ri:hover,.ri:active{background:#ede9fd}
  .ric{font-size:15px;flex-shrink:0;margin-top:1px}

  /* ── Map ── */
  #map{position:absolute;inset:0;z-index:0}

  /* ── Bottom coord pill ── */
  #cp{
    position:absolute;bottom:12px;left:12px;right:12px;z-index:1000;
    background:rgba(255,255,255,.95);backdrop-filter:blur(10px);
    border-radius:14px;padding:11px 14px;
    box-shadow:0 4px 20px rgba(0,0,0,.14);
    display:none;align-items:center;gap:10px;
    border:1.5px solid #6b4ce6;
  }
  #cn{font-size:13px;font-weight:700;color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
  #cl{font-size:11px;color:#6b7280;margin-top:1px}
  #ub{
    background:linear-gradient(135deg,#6b4ce6,#5538d4);
    color:#fff;border:none;border-radius:9px;
    padding:9px 15px;font-size:12px;font-weight:700;cursor:pointer;
    white-space:nowrap;flex-shrink:0;
  }
  #ub:active{opacity:.85}

  /* ── Loader ── */
  #ld{
    position:absolute;top:58px;left:50%;transform:translateX(-50%);
    background:rgba(107,76,230,.92);color:#fff;border-radius:8px;
    padding:6px 14px;font-size:12px;z-index:2000;display:none;
    white-space:nowrap;
  }
</style>
</head>
<body>
<div id="map"></div>

<div id="sw">
  <input id="si" type="text" placeholder="🔍 Cari nama tempat atau alamat...">
  <button id="sc" onclick="clearSearch()">✕</button>
  <div id="rl"></div>
</div>

<div id="cp">
  <div style="flex:1;overflow:hidden">
    <div id="cn">Titik dipilih</div>
    <div id="cl"></div>
  </div>
  <button id="ub" onclick="useLocation()">Gunakan →</button>
</div>

<div id="ld">Mencari...</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
// ─── RN bridge helpers ────────────────────────────────────────────────────
function rnPost(data){ try{ window.ReactNativeWebView.postMessage(JSON.stringify(data)); }catch(e){} }

// ─── Map init ─────────────────────────────────────────────────────────────
var map = L.map('map',{zoomControl:false,attributionControl:true})
           .setView([${initLat},${initLng}],${DEFAULT_ZOOM});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'© OpenStreetMap',maxZoom:19
}).addTo(map);

L.control.zoom({position:'bottomright'}).addTo(map);

// Custom pin
var PIN = L.divIcon({
  className:'',
  html:'<div style="width:30px;height:30px;background:linear-gradient(135deg,#6b4ce6,#5538d4);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 14px rgba(107,76,230,.55)"></div>',
  iconSize:[30,30],iconAnchor:[15,30]
});

var marker = null;
var selLat = null, selLng = null, selName = '';

var hasInit = (${initLat} !== ${DEFAULT_LAT} || ${initLng} !== ${DEFAULT_LNG});
if(hasInit){ placeMarker(${initLat},${initLng},'Lokasi saat ini'); }

// ─── Touch: notify RN to lock/unlock parent scroll ───────────────────────
document.getElementById('map').addEventListener('touchstart', function(){
  rnPost({type:'MAP_TOUCH_START'});
},{passive:true});
document.getElementById('map').addEventListener('touchend', function(){
  rnPost({type:'MAP_TOUCH_END'});
},{passive:true});
document.getElementById('map').addEventListener('touchcancel', function(){
  rnPost({type:'MAP_TOUCH_END'});
},{passive:true});

// ─── Map click ────────────────────────────────────────────────────────────
map.on('click',function(e){
  placeMarker(e.latlng.lat,e.latlng.lng,'Titik dipilih');
  reverseGeocode(e.latlng.lat,e.latlng.lng);
});

// ─── Marker ───────────────────────────────────────────────────────────────
function placeMarker(lat,lng,name){
  selLat=lat; selLng=lng; selName=name||'Titik dipilih';
  if(marker) map.removeLayer(marker);
  marker=L.marker([lat,lng],{icon:PIN}).addTo(map);
  showPill(lat,lng,selName);
}

function showPill(lat,lng,name){
  var short = name.split(',').slice(0,2).join(',').trim();
  document.getElementById('cn').textContent = short||name;
  document.getElementById('cl').textContent = lat.toFixed(6)+', '+lng.toFixed(6);
  document.getElementById('cp').style.display='flex';
}

// ─── Use location ─────────────────────────────────────────────────────────
function useLocation(){
  if(!selLat) return;
  rnPost({type:'LOCATION_SELECTED',lat:selLat.toFixed(7),lng:selLng.toFixed(7),displayName:selName});
}

// ─── Reverse geocode ──────────────────────────────────────────────────────
function reverseGeocode(lat,lng){
  fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lng+'&accept-language=id',
    {headers:{'Accept':'application/json','User-Agent':'NikahinApp/1.0'}})
  .then(function(r){return r.json();})
  .then(function(d){
    if(!d||!d.display_name) return;
    selName=d.display_name;
    var a=d.address||{};
    var short=(a.road||a.village||a.suburb||d.display_name.split(',')[0])
              +(a.city?', '+a.city:'');
    document.getElementById('cn').textContent=short;
  }).catch(function(){});
}

// ─── Search ───────────────────────────────────────────────────────────────
var si=document.getElementById('si');
var sc=document.getElementById('sc');
var rl=document.getElementById('rl');
var ld=document.getElementById('ld');
var lastRes=[];
var timer=null;

si.addEventListener('input',function(){
  var v=this.value.trim();
  sc.style.display=v?'block':'none';
  if(timer) clearTimeout(timer);
  if(v.length<3){rl.style.display='none';return;}
  timer=setTimeout(function(){doSearch(v);},500);
});

si.addEventListener('keydown',function(e){
  if(e.key==='Enter'&&lastRes.length) selectResult(0);
});

function doSearch(q){
  ld.style.display='block'; rl.style.display='none';
  var url='https://nominatim.openstreetmap.org/search?format=json&q='+encodeURIComponent(q)
          +'&limit=6&accept-language=id&countrycodes=id';
  fetch(url,{headers:{'Accept':'application/json','User-Agent':'NikahinApp/1.0'}})
  .then(function(r){return r.json();})
  .then(function(data){
    ld.style.display='none';
    lastRes=data;
    if(!data.length){
      rl.innerHTML='<div class="ri" style="color:#9ca3af;font-style:italic"><span class="ric">🔍</span>Lokasi tidak ditemukan</div>';
      rl.style.display='block'; return;
    }
    rl.innerHTML=data.map(function(r,i){
      var p=r.display_name.split(',');
      var m=p.slice(0,2).join(',').trim();
      var s=p.slice(2,4).join(',').trim();
      return '<div class="ri" onclick="selectResult('+i+')"><span class="ric">📍</span>'
        +'<div><div style="font-weight:700;color:#1a1a2e;font-size:13px">'+m+'</div>'
        +(s?'<div style="font-size:11px;color:#9ca3af;margin-top:1px">'+s+'</div>':'')
        +'</div></div>';
    }).join('');
    rl.style.display='block';
  })
  .catch(function(){
    ld.style.display='none';
    rl.innerHTML='<div class="ri" style="color:#ef4444"><span class="ric">⚠️</span>Gagal mencari, coba lagi</div>';
    rl.style.display='block';
  });
}

function selectResult(i){
  var r=lastRes[i]; if(!r) return;
  var lat=parseFloat(r.lat),lng=parseFloat(r.lon);
  map.setView([lat,lng],16);
  placeMarker(lat,lng,r.display_name);
  rl.style.display='none';
  si.value=r.display_name.split(',').slice(0,2).join(',').trim();
}

function clearSearch(){
  si.value=''; sc.style.display='none';
  rl.style.display='none'; lastRes=[];
}

map.on('click',function(){rl.style.display='none';});
</script>
</body>
</html>`;

const LeafletLocationPicker = ({
  latitude,
  longitude,
  onLocationSelect,
  height = 320,
  scrollRef,       // ref ke ScrollView parent untuk lock/unlock
}) => {
  const webViewRef = useRef(null);
  const [mapTouching, setMapTouching] = useState(false);

  const initLat = latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : DEFAULT_LAT;
  const initLng = longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : DEFAULT_LNG;

  const html = buildHtml(initLat, initLng);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'MAP_TOUCH_START') {
        setMapTouching(true);
        // Disable scroll di ScrollView parent
        if (scrollRef?.current?.setNativeProps) {
          scrollRef.current.setNativeProps({ scrollEnabled: false });
        }
      } else if (data.type === 'MAP_TOUCH_END') {
        setMapTouching(false);
        // Re-enable scroll
        if (scrollRef?.current?.setNativeProps) {
          scrollRef.current.setNativeProps({ scrollEnabled: true });
        }
      } else if (data.type === 'LOCATION_SELECTED' && onLocationSelect) {
        // Re-enable scroll saat user selesai memilih
        if (scrollRef?.current?.setNativeProps) {
          scrollRef.current.setNativeProps({ scrollEnabled: true });
        }
        setMapTouching(false);
        onLocationSelect({
          lat: data.lat,
          lng: data.lng,
          displayName: data.displayName,
        });
      }
    } catch (_) {}
  }, [onLocationSelect, scrollRef]);

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        mixedContentMode="always"
        allowsInlineMediaPlayback
        // Penting: intercept gesture di WebView agar tidak bocor ke parent
        nestedScrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default LeafletLocationPicker;
