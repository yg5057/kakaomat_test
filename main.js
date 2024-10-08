var placesData = []; // JSON 데이터를 여기에 저장할 변수
var mapContainer = document.getElementById('map'),
    mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 13,
        draggable: true,
        scrollwheel: true,
        disableDoubleClickZoom: false
    };

var map = new kakao.maps.Map(mapContainer, mapOption);
var geocoder = new kakao.maps.services.Geocoder();
var placeMarkers = []; // 마커를 저장할 배열
var destinationMarker = null; // 목적지 마커 초기값 null로 설정
var currentPolyline = null; // 현재 표시된 경로 Polyline을 저장할 변수
var currentInfowindow = null; // 현재 열려 있는 인포메이션 윈도우를 저장할 변수

// JSON 데이터 불러오기
fetch('places.json')
    .then(response => response.json())
    .then(data => {
        placesData = data;
        displayPlaces(placesData);
    })
    .catch(error => console.error('JSON 데이터 불러오기 실패:', error));

// 사용자 위치 가져오기
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var userLocation = new kakao.maps.LatLng(lat, lon);
        map.setCenter(userLocation);

        // 사용자 위치에 기본 마커 표시
        var startMarker = new kakao.maps.Marker({
            position: userLocation,
            title: '출발지',
            image: new kakao.maps.MarkerImage('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', new kakao.maps.Size(30, 40))
        });
        startMarker.setMap(map);
        var startInput = document.getElementById('start');

        // 사용자의 현재 위치를 주소로 변환
        geocoder.coord2Address(lon, lat, function (result, status) {
            if (status === kakao.maps.services.Status.OK) {
                startInput.value = result[0].address.address_name;
                startInput.disabled = false;
            }
        });
    }, function (error) {
        alert("위치 정보를 사용할 수 없습니다. 직접 출발지를 입력해주세요.");
        document.getElementById('start').disabled = false;
    });
} else {
    alert("브라우저에서 위치 정보를 지원하지 않습니다. 출발지를 입력해주세요.");
    document.getElementById('start').disabled = false;
}


// 지역에 따른 마커 색상 설정 함수
function getMarkerImage(area) {
    var areaImages = {
        '강원': 'images/pink.png',
        '경기': 'images/skyblue.png',
        '경남': 'images/yellow.png',
        '경북': 'images/blue.png',
        '광주': 'images/red.png',
        '대구': 'images/blue.png',
        '부산': 'images/yellow.png',
        '세종': 'images/green.png',
        '울산': 'images/yellow.png',
        '인천': 'images/skyblue.png',
        '전남': 'images/red.png',
        '전북': 'images/red.png',
        '충남': 'images/green.png',
        '충북': 'images/green.png'
    };

    var imageSrc = areaImages[area] || 'https://t1.daumcdn.net/mapjsapi/images/2x/marker.png'; 
    var imageSize = new kakao.maps.Size(30, 40);

    return new kakao.maps.MarkerImage(imageSrc, imageSize);
}


// 기존 인포메이션 윈도우 대신 사용할 커스텀 오버레이 생성 함수
function createCustomOverlay(content) {
    var overlay = new kakao.maps.CustomOverlay({
        content: content,
        position: null, // 초기 위치는 설정하지 않음
        yAnchor: 1 // 위치를 마커 위에 맞춤
    });
    return overlay;
}


// 장소 리스트 표시 함수
function displayPlaces(places) {
    var placesList = document.getElementById('places');
    placesList.innerHTML = ''; // 기존 리스트 초기화

       // 지역에 따른 색상 정의
       const areaColors = {
        '강원': '#FF66C4',
        '경기': '#10C0DF',
        '경남': '#D9BD4C',
        '경북': '#004AAD',
        '광주': '#FF5758',
        '대구': '#004AAD',
        '부산': '#D9BD4C',
        '세종': '#58CD94',
        '울산': '#D9BD4C',
        '인천': '#10C0DF',
        '전남': '#FF5758',
        '전북': '#FF5758',
        '충남': '#58CD94',
        '충북': '#58CD94'
    };

    places.forEach(function (place) {
        var li = document.createElement('li');
        var color = areaColors[place.area] || '#248CFA'; // 기본 색상 (검정)
        li.innerHTML = `
            <div class="li-container" onclick="setDestination('${place.title}', '${place.address}', '${place.url}', '${place.area}')">
                <div class="li-eclipse" style="background-color: ${color};">${place.area}</div>
                <div class="li-textWrap">
                    <div class="li-text-title">${place.title}</div>
                    <div class="li-text-address">${place.address}</div>
                </div>
            </div>
        `;
        placesList.appendChild(li);

               // 장소에 커스텀 마커 표시
               geocoder.addressSearch(place.address, function (result, status) {
                if (status === kakao.maps.services.Status.OK) {
                    var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
    
                    // 기본 마커 생성
                    var placeMarker = new kakao.maps.Marker({
                        position: coords,
                        image: getMarkerImage(place.area) // 지역에 따른 마커 색상 적용
                    });
                    placeMarker.setMap(map);
    

                // 커스텀 오버레이 내용
                var overlayContent = `
                    <div class="overlay_info">
                        <a href="${place.url}" target="_blank">
                            <strong>${place.title}</strong>
                        </a>
                        <div class="desc">
                            <span class="address">${place.address}</span>
                        </div>
                        <button class="close-btn" onclick="closeOverlay(event)">닫기</button>
                    </div>
                `;
                var overlay = createCustomOverlay(overlayContent);

            // 마커 클릭 시 커스텀 오버레이 표시
            kakao.maps.event.addListener(placeMarker, 'click', function () {
                overlay.setPosition(placeMarker.getPosition()); // 마커 위치에 오버레이 위치 설정
                overlay.setMap(map); // 오버레이 지도에 표시
                setDestination(place.title, place.address, place.url);

          // 기존 커스텀 오버레이가 열려 있으면 닫기
                    if (currentInfowindow) {
                        currentInfowindow.setMap(null);
                    }
                    currentInfowindow = overlay; // 현재 열려 있는 커스텀 오버레이를 저장
                });
            placeMarkers.push(placeMarker); // 마커 배열에 추가
                }
            });
        });
    }


// 커스텀 오버레이 닫기 함수
function closeOverlay(event) {
    event.stopPropagation(); // 클릭 이벤트 전파 방지
    if (currentInfowindow) {
        currentInfowindow.setMap(null); // 오버레이 닫기
        currentInfowindow = null; // 현재 오버레이 초기화
    }
}
    // 검색 기능 추가
    document.getElementById('searchInput').addEventListener('input', function () {
        var query = this.value.toLowerCase(); // 입력값을 소문자로 변환하여 검색
        var filteredPlaces = placesData.filter(function (place) {
            return place.title.toLowerCase().includes(query) || place.address.toLowerCase().includes(query) || place.area.toLowerCase().includes(query);
        });
        displayPlaces(filteredPlaces); // 필터링된 장소 표시
    });
    
    // 경로 찾기 이벤트 리스너
    document.getElementById('routeForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var startAddress = document.getElementById('start').value;
        var endAddress = document.getElementById('end').value;
    
        if (startAddress && endAddress) {
            showLoadingModal(); // 로딩 모달 표시
            geocodeAndFindRoute(startAddress, endAddress);
            
            // 모든 커스텀 마커 숨기기
            placeMarkers.forEach(function (marker) {
                marker.setMap(null); // 마커 숨기기
            });
        } else {
            alert('출발지와 목적지를 모두 입력해주세요.');
        }
    });
    
 var currentInfowindow = null; // 현재 열려 있는 인포메이션 윈도우를 저장할 변수

   // 목적지 설정 함수
function setDestination(title, address, url) {
    // 목적지 입력 필드에 주소 입력
    document.getElementById('end').value = address;

    // 주소 검색하여 마커와 인포메이션 윈도우 표시
    geocoder.addressSearch(address, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            // 기존 마커가 있다면 제거
            if (destinationMarker) {
                destinationMarker.setMap(null); // 이전 마커 숨기기
            }

            // 새로운 목적지 마커 생성
            destinationMarker = new kakao.maps.Marker({
                position: coords // 선택한 장소의 좌표
            });
            destinationMarker.setMap(map); // 새로운 목적지 마커 지도에 표시

            // 지도를 해당 장소로 이동
            map.setCenter(coords);

            // 커스텀 오버레이 내용
            var overlayContent = `
                  <div class="overlay_info">
                        <a href="${url}" target="_blank">
                            <strong>${title}</strong>
                        </a>
                        <div class="desc">
                            <span class="address">${address}</span>
                            <button class="close-btn" onclick="closeOverlay(event)">
                                <i class="fas fa-times"></i> <!-- FontAwesome X 아이콘 -->
                            </button>
                        </div>
                    </div>
            `;
              // 기존 커스텀 오버레이가 열려 있으면 닫기
              if (currentInfowindow) {
                currentInfowindow.setMap(null);
            }

            // 새로운 커스텀 오버레이 생성
            var overlay = createCustomOverlay(overlayContent);
            overlay.setPosition(destinationMarker.getPosition()); // 마커 위치에 오버레이 위치 설정
            overlay.setMap(map); // 오버레이 지도에 표시
            currentInfowindow = overlay; // 현재 열려 있는 커스텀 오버레이를 저장

            // 경로 UI를 초기화하고 숨기기
            if (currentPolyline) {
                currentPolyline.setMap(null); // 기존 경로 숨기기
                currentPolyline = null; // 현재 폴리라인 변수 초기화
            }
            document.getElementById('result').innerHTML = ''; // 결과 UI 초기화
        } else {
            alert("주소를 찾을 수 없습니다.");
        }
    });
}

  // 커스텀 오버레이 생성 함수
function createCustomOverlay(content) {
    var overlay = new kakao.maps.CustomOverlay({
        content: content,
        map: map,
        position: new kakao.maps.LatLng(0, 0), // 초기 위치는 임의로 설정
        yAnchor: 1 // 커스텀 오버레이가 마커의 아래쪽에 위치하도록 설정
    });
    return overlay;
}  


    // 경로 검색 함수
    function geocodeAndFindRoute(start, end) {
        geocoder.addressSearch(start, function (result, status) {
            if (status === kakao.maps.services.Status.OK) {
                var startCoords = new kakao.maps.LatLng(result[0].y, result[0].x);
    
                // 출발지 마커 표시
                var startMarker = new kakao.maps.Marker({
                    position: startCoords,
                    image: new kakao.maps.MarkerImage('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', new kakao.maps.Size(30, 40))
                });
                startMarker.setMap(map);
    
                geocoder.addressSearch(end, function (result, status) {
                    if (status === kakao.maps.services.Status.OK) {
                        var endCoords = new kakao.maps.LatLng(result[0].y, result[0].x);
                        findRoute(startCoords, endCoords);
                    } else {
                        alert('목적지 주소 변환에 실패했습니다.');
                        hideLoadingModal(); // 로딩 모달 숨김
                    }
                });
            } else {
                alert('출발지 주소 변환에 실패했습니다.');
                hideLoadingModal(); // 로딩 모달 숨김
            }
        });
    }
    
    // 경로 찾기 함수
    function findRoute(startCoords, endCoords) {
        var apiUrl = `https://apis-navi.kakaomobility.com/v1/directions?origin=${startCoords.getLng()},${startCoords.getLat()}&destination=${endCoords.getLng()},${endCoords.getLat()}&priority=RECOMMEND&vehicle=car`;
    
        fetch(apiUrl, {
            headers: {
                "Authorization": "KakaoAK 8e2c134c22f8c379da88ce3fc7bc85a4"
            }
        })
        .then(response => response.json())
        .then(data => {
            var route = data.routes[0];
            var distance = route.summary.distance;
            var duration = route.summary.duration;
    
            // 소요 시간을 시와 분으로 변환
            var hours = Math.floor(duration / 3600); // 시
            var minutes = Math.floor((duration % 3600) / 60); // 분
    
            hideLoadingModal(); // 로딩 모달 숨김
    
            document.getElementById('result').innerHTML = `
                <div class="cl-1-input ">
                    <label class="cl-1-label">거리</label>
                    <div class="cl-1-input-text">${(distance / 1000).toFixed(1)} km</div>
                </div>
                <div class="cl-1-input ">
                    <label class="cl-1-label">시간</label>
                    <div class="cl-1-input-text">${hours}시간 ${minutes}분</div>
                </div>                
            `;
    
            // 경로 표시
            var path = route.sections[0].roads.reduce(function (acc, road) {
                road.vertexes.forEach(function (vertex, index) {
                    if (index % 2 === 0) {
                        acc.push(new kakao.maps.LatLng(road.vertexes[index + 1], vertex));
                    }
                });
                return acc;
            }, []);
    
            // 이전 경로 삭제
            if (currentPolyline) {
                currentPolyline.setMap(null); // 기존 경로 삭제
            }
    
            // 새로운 경로 표시
            currentPolyline = new kakao.maps.Polyline({
                path: path,
                strokeWeight: 6,
                strokeColor: '#00BFFF',
                strokeOpacity: 0.8
            });
            currentPolyline.setMap(map);
    
            // 지도의 범위를 경로에 맞게 조정
            var bounds = new kakao.maps.LatLngBounds();
            path.forEach(function (latlng) {
                bounds.extend(latlng);
            });
            map.setBounds(bounds);
    
            // 목적지 마커 표시
            var endAddress = document.getElementById('end').value; // 사용자가 입력한 목적지 주소
            var destinationPlace = placesData.find(place => place.address === endAddress);
    
            if (destinationPlace) {
                if (destinationMarker) {
                    destinationMarker.setMap(null); // 이전 마커 숨기기
                }
                // 새로운 목적지 마커 생성
                destinationMarker = new kakao.maps.Marker({
                    position: endCoords // 목적지 좌표
                });
                destinationMarker.setMap(map); // 목적지 마커 표시
            } else {
                alert('목적지 정보가 없습니다.');
            }
        })
        .catch(error => {
            console.error('경로 검색 중 오류 발생:', error);
            hideLoadingModal(); // 로딩 모달 숨김
        });
    }
    
    // 로딩 모달 표시 함수
    function showLoadingModal() {
        document.getElementById('loadingModal').style.display = 'flex';
    }
    
    // 로딩 모달 숨김 함수
    function hideLoadingModal() {
        document.getElementById('loadingModal').style.display = 'none';
    }
    


