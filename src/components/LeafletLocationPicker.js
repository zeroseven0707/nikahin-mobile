/**
 * LeafletLocationPicker
 *
 * Komponen peta interaktif menggunakan Leaflet (via WebView inline HTML).
 * Search lokasi menggunakan Nominatim (OpenStreetMap) — gratis, tanpa API key.
 *
 * Props:
 *   latitude  {string}  - koordinat awal (opsional)
 *   longitude {string}  - koordinat awal (opsional)
 *   onLocationSelect {function} - callback({ lat, lng, displayName })
 *   height {number} - tinggi peta dalam px (default 320)
 */
import React, { useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const DEFAULT_LAT  = -6.2088;   // Jakarta
const DEFAULT_LNG  = 106.8456;
const DEFAULT_ZOOM = 13;

const buildHtml = (initLat, initLng) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,sans-serif}
  body{background:#f4f5f9;overflow:hidden}

  /* ── Search bar ── */
  #search-wrap{
    position:absolute;top:10px;left:10px;right:10px;z-index:1000;
  }
  #search-input{
    width:100%;padding:10px 40px 10px 14px;
    border:2px solid #6b4ce6;border-radius:12px;
    background:#fff;font-size:14px;color:#1a1a2e;
    box-shadow:0 4px 16px rgba(107,76,230,.18);
    outline:none;
  }
  #search-input::placeholder{color:#9ca3af}
  #search-clear{
    position:absolute;right:10px;top:50%;transform:translateY(-50%);
    background:none;border:none;cursor:pointer;font-size:18px;color:#9ca3af;
    display:none;
  }
  #results{
    position:absolute;top:48px;left:0;right:0;
    background:#fff;border-radius:12px;overflow:hidden;
    box-shadow:0 8px 24px rgba(0,0,0,.12);max-height:200px;overflow-y:auto;
    display:none;
  }
  .result-item{
    padding:10px 14px;border-bottom:1px solid #f3f4f6;
    cursor:pointer;font-size:13px;color:#374151;
    display:flex;align-items:center;gap:8px;
  }
  .result-item:last-child{border-bottom:none}
  .result-item:hover{background:#ede9fd}
  .result-icon{font-size:16px;flex-shrink:0}

  /* ── Map ── */
  #map{position:absolute;top:0;left:0;right:0;bottom:0}

  /* ── Coord pill ── */
  #coord-pill{
    position:absolute;bottom:12px;left:12px;right:12px;z-index:1000;
    background:rgba(255,255,255,.92);backdrop-filter:blur(8px);
    border-radius:12px;padding:10px 14px;
    box-shadow:0 4px 16px rgba(0,0,0,.12);
    display:flex;align-items:center;gap:8px;
    border:1.5px solid #6b4ce6;
  }
  #coord-icon{font-size:18px}
  #coord-text{flex:1;font-size:12px;color:#6b7280;line-height:1.5}
  #coord-text strong{color:#1a1a2e;font-size:13px;display:block}
  #use-btn{
    background:linear-gradient(135deg,#6b4ce6,#5538d4);
    color:#fff;border:none;border-radius:9px;
    padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer;
    white-space:nowrap;
  }

  /* Loader */
  #loader{
    position:absolute;top:60px;left:50%;transform:translateX(-50%);
    background:rgba(107,76,230,.9);color:#fff;border-radius:8px;
    padding:6px 14px;font-size:12px;z-index:2000;display:none;
  }
</style>
</head>
<body>

<div id="map"></div>

<div id="search-wrap">
  <input id="search-input" type="text" placeholder="🔍 Cari lokasi...">
  <button id="search-clear" onclick="clearSearch()">✕</button>
  <div id="results"></div>
</div>

<div id="coord-pill" style="display:none">
  <span id="coord-icon">📍</span>
  <div id="coord-text">
    <strong id="coord-name">Titik dipilih</strong>
    <span id="coord-latlon"></span>
  </div>
  <button id="use-btn" onclick="useLocation()">Gunakan</button>
</div>

<div id="loader">Mencari...</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
// ── State ──────────────────────────────────────────────────────────────
var map, marker;
var selectedLat = null, selectedLng = null, selectedName = '';
var searchTimer = null;
var lastResults = [];

// ── Init map ───────────────────────────────────────────────────────────
map = L.map('map', { zoomControl: false, attributionControl: true }).setView(
  [${initLat}, ${initLng}], ${DEFAULT_ZOOM}
);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);

L.control.zoom({ position: 'bottomright' }).addTo(map);

// Custom marker icon
var pinIcon = L.divIcon({
  className: '',
  html: '<div style="width:32px;height:32px;background:linear-gradient(135deg,#6b4ce6,#5538d4);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 12px rgba(107,76,230,.5)"></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Jika sudah ada koordinat awal, pasang marker
var hasInit = (${initLat} !== ${DEFAULT_LAT} || ${initLng} !== ${DEFAULT_LNG});
if (hasInit) {
  placeMarker(${initLat}, ${initLng}, 'Lokasi saat ini');
}

// ── Map click ──────────────────────────────────────────────────────────
map.on('click', function(e) {
  placeMarker(e.latlng.lat, e.latlng.lng, 'Titik dipilih');
  reverseGeocode(e.latlng.lat, e.latlng.lng);
});

// ── Place marker ───────────────────────────────────────────────────────
function placeMarker(lat, lng, name) {
  selectedLat = lat;
  selectedLng = lng;
  selectedName = name || 'Titik dipilih';
  if (marker) map.removeLayer(marker);
  marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
  showCoordPill(lat, lng, selectedName);
}

function showCoordPill(lat, lng, name) {
  document.getElementById('coord-name').textContent = name;
  document.getElementById('coord-latlon').textContent =
    lat.toFixed(6) + ', ' + lng.toFixed(6);
  document.getElementById('coord-pill').style.display = 'flex';
}

// ── Use location — send to RN ──────────────────────────────────────────
function useLocation() {
  if (!selectedLat) return;
  var msg = JSON.stringify({
    type: 'LOCATION_SELECTED',
    lat: selectedLat.toFixed(7),
    lng: selectedLng.toFixed(7),
    displayName: selectedName,
  });
  try { window.ReactNativeWebView.postMessage(msg); } catch(e) {}
}

// ── Reverse geocode ────────────────────────────────────────────────────
function reverseGeocode(lat, lng) {
  var url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&accept-language=id';
  fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'NikahinApp/1.0' } })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (data && data.display_name) {
        selectedName = data.display_name;
        document.getElementById('coord-name').textContent =
          (data.address && (data.address.road || data.address.village || data.address.suburb))
          ? (data.address.road || data.address.village || data.address.suburb) + (data.address.city ? ', ' + data.address.city : '')
          : data.display_name.split(',').slice(0,2).join(',');
      }
    })
    .catch(function(){});
}

// ── Search ─────────────────────────────────────────────────────────────
var searchInput  = document.getElementById('search-input');
var searchClear  = document.getElementById('search-clear');
var resultsDiv   = document.getElementById('results');
var loaderDiv    = document.getElementById('loader');

searchInput.addEventListener('input', function() {
  var val = this.value.trim();
  searchClear.style.display = val.length ? 'block' : 'none';
  if (searchTimer) clearTimeout(searchTimer);
  if (val.length < 3) { resultsDiv.style.display = 'none'; return; }
  searchTimer = setTimeout(function(){ doSearch(val); }, 500);
});

searchInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && lastResults.length) selectResult(0);
});

function doSearch(q) {
  loaderDiv.style.display = 'block';
  resultsDiv.style.display = 'none';
  var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(q) + '&limit=6&accept-language=id&countrycodes=id';
  fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'NikahinApp/1.0' } })
    .then(function(r){ return r.json(); })
    .then(function(data){
      loaderDiv.style.display = 'none';
      lastResults = data;
      if (!data.length) {
        resultsDiv.innerHTML = '<div class="result-item" style="color:#9ca3af;font-style:italic"><span class="result-icon">🔍</span>Lokasi tidak ditemukan</div>';
        resultsDiv.style.display = 'block';
        return;
      }
      resultsDiv.innerHTML = data.map(function(r, i){
        var parts = r.display_name.split(',');
        var main  = parts.slice(0,2).join(',').trim();
        var sub   = parts.slice(2,4).join(',').trim();
        return '<div class="result-item" onclick="selectResult(' + i + ')">' +
          '<span class="result-icon">📍</span>' +
          '<div><div style="font-weight:600;color:#1a1a2e;font-size:13px">' + main + '</div>' +
          (sub ? '<div style="font-size:11px;color:#9ca3af;margin-top:1px">' + sub + '</div>' : '') +
          '</div></div>';
      }).join('');
      resultsDiv.style.display = 'block';
    })
    .catch(function(){
      loaderDiv.style.display = 'none';
      resultsDiv.innerHTML = '<div class="result-item" style="color:#ef4444"><span class="result-icon">⚠️</span>Gagal mencari, coba lagi</div>';
      resultsDiv.style.display = 'block';
    });
}

function selectResult(index) {
  var r = lastResults[index];
  if (!r) return;
  var lat = parseFloat(r.lat), lng = parseFloat(r.lon);
  map.setView([lat, lng], 16);
  placeMarker(lat, lng, r.display_name);
  resultsDiv.style.display = 'none';
  searchInput.value = r.display_name.split(',').slice(0,2).join(',').trim();
}

function clearSearch() {
  searchInput.value = '';
  searchClear.style.display = 'none';
  resultsDiv.style.display = 'none';
  lastResults = [];
}

// Close results on map interaction
map.on('click', function(){ resultsDiv.style.display = 'none'; });
</script>
</body>
</html>`;

const LeafletLocationPicker = ({ latitude, longitude, onLocationSelect, height = 320 }) => {
  const webViewRef = useRef(null);

  const initLat = latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : DEFAULT_LAT;
  const initLng = longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : DEFAULT_LNG;

  const html = buildHtml(initLat, initLng);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'LOCATION_SELECTED' && onLocationSelect) {
        onLocationSelect({
          lat: data.lat,
          lng: data.lng,
          displayName: data.displayName,
        });
      }
    } catch (_) {}
  }, [onLocationSelect]);

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
        nestedScrollEnabled={false}
        // Allow network requests for tile & Nominatim
        allowsBackForwardNavigationGestures={false}
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
