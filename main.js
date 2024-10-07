// var placesData = []; // JSON 데이터를 여기에 저장할 변수
// var mapContainer = document.getElementById('map'),
//     mapOption = {
//         center: new kakao.maps.LatLng(37.5665, 126.9780),
//         level: 13,
//         draggable: true,
//         scrollwheel: true,
//         disableDoubleClickZoom: false
//     };

// var map = new kakao.maps.Map(mapContainer, mapOption);
// var geocoder = new kakao.maps.services.Geocoder();
// var placeMarkers = []; // 마커를 저장할 배열
// var destinationMarker = null; // 목적지 마커 초기값 null로 설정
// var currentPolyline = null; // 현재 표시된 경로 Polyline을 저장할 변수

// // JSON 데이터 불러오기
// fetch('places.json')
//     .then(response => response.json())
//     .then(data => {
//         placesData = data;
//         displayPlaces();
//     })
//     .catch(error => console.error('JSON 데이터 불러오기 실패:', error));

// // 사용자 위치 가져오기
// if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(function (position) {
//         var lat = position.coords.latitude;
//         var lon = position.coords.longitude;
//         var userLocation = new kakao.maps.LatLng(lat, lon);
//         map.setCenter(userLocation);

//         // 사용자 위치에 기본 마커 표시
//         var startMarker = new kakao.maps.Marker({
//             position: userLocation,
//             title: '출발지',
//             image: new kakao.maps.MarkerImage('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', new kakao.maps.Size(30, 40))
//         });
//         startMarker.setMap(map);
//         var startInput = document.getElementById('start');

//         // 사용자의 현재 위치를 주소로 변환
//         geocoder.coord2Address(lon, lat, function (result, status) {
//             if (status === kakao.maps.services.Status.OK) {
//                 startInput.value = result[0].address.address_name;
//                 startInput.disabled = false;
//             }
//         });
//     }, function (error) {
//         alert("위치 정보를 사용할 수 없습니다. 직접 출발지를 입력해주세요.");
//         document.getElementById('start').disabled = false;
//     });
// } else {
//     alert("브라우저에서 위치 정보를 지원하지 않습니다. 출발지를 입력해주세요.");
//     document.getElementById('start').disabled = false;
// }

// // 장소 리스트 표시
// function displayPlaces() {
//     var placesList = document.getElementById('places');
//     placesData.forEach(function (place) {
//         var li = document.createElement('li');
//         li.innerHTML = `
//             <div class="li-container" onclick="setDestination('${place.title}', '${place.address}', '${place.area}')">
//                 <div class="li-eclipse">${place.area}</div>
//                 <div class="li-textWrap">
//                     <div class="li-text-title">${place.title}</div>
//                     <div class="li-text-address">${place.address}</div>
//                 </div>
//             </div>
//         `;
//         placesList.appendChild(li);

//                // 장소에 커스텀 마커 표시
//                geocoder.addressSearch(place.address, function (result, status) {
//                 if (status === kakao.maps.services.Status.OK) {
//                     var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
    
//                     // 기본 마커 생성
//                     var placeMarker = new kakao.maps.Marker({
//                         position: coords
//                     });
//                     placeMarker.setMap(map);
    
//                     // 인포메이션 윈도우 생성
//                     var infowindowContent = `
//                     <div class="marker-info">    
//                         <div>
//                             <span>${place.title}&nbsp;&nbsp;                             
//                                 <a href="${place.url}" target="_blank">
//                                     <i class="fas fa-chevron-right"></i>
//                                 </a>
//                             </span>
//                         </div>
//                     </div>
//                     `;
//                     var infowindow = new kakao.maps.InfoWindow({
//                         content: infowindowContent,
//                         removable: true
//                     });
    
//                     // 마커 클릭 시 인포메이션 윈도우 열기
//                     kakao.maps.event.addListener(placeMarker, 'click', function () {
//                         infowindow.open(map, placeMarker);
//                     });
    
//                     // 마커 클릭 시 목적지 설정
//                     kakao.maps.event.addListener(placeMarker, 'click', function () {
//                         setDestination(place.title, place.address, place.url);
//                     });
    
//                     placeMarkers.push(placeMarker); // 마커 배열에 추가
//                 }
//             });
//         });
//     }
    
//     // 경로 찾기 이벤트 리스너
//     document.getElementById('routeForm').addEventListener('submit', function (e) {
//         e.preventDefault();
//         var startAddress = document.getElementById('start').value;
//         var endAddress = document.getElementById('end').value;
    
//         if (startAddress && endAddress) {
//             showLoadingModal(); // 로딩 모달 표시
//             geocodeAndFindRoute(startAddress, endAddress);
            
//             // 모든 커스텀 마커 숨기기
//             placeMarkers.forEach(function (marker) {
//                 marker.setMap(null); // 마커 숨기기
//             });
//         } else {
//             alert('출발지와 목적지를 모두 입력해주세요.');
//         }
//     });
    
//     var currentInfowindow = null; // 현재 열려 있는 인포메이션 윈도우를 저장할 변수

//    // 목적지 설정 함수
// function setDestination(title, address, url) {
//     // 목적지 입력 필드에 주소 입력
//     document.getElementById('end').value = address;

//     // 주소 검색하여 마커와 인포메이션 윈도우 표시
//     geocoder.addressSearch(address, function (result, status) {
//         if (status === kakao.maps.services.Status.OK) {
//             var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

//             // 기존 마커가 있다면 제거
//             if (destinationMarker) {
//                 destinationMarker.setMap(null); // 이전 마커 숨기기
//             }

//             // 새로운 목적지 마커 생성
//             destinationMarker = new kakao.maps.Marker({
//                 position: coords // 선택한 장소의 좌표
//             });
//             destinationMarker.setMap(map); // 새로운 목적지 마커 지도에 표시

//             // 지도를 해당 장소로 이동
//             map.setCenter(coords);

//             // 마커 인포메이션 윈도우 내용
//             var infowindowContent = `
//                 <div class="marker-info">    
//                     <div>
//                         <span>${title}&nbsp;&nbsp;
//                             <a href="${url}" target="_blank">
//                                 <i class="fas fa-chevron-right"></i>
//                             </a>
//                         </span>
//                     </div>
//                 </div>
//             `;

//             // 인포메이션 윈도우 생성
//             var infowindow = new kakao.maps.InfoWindow({
//                 content: infowindowContent,
//                 removable: true // 윈도우 닫기 버튼 추가
//             });

//             // 이전 인포메이션 윈도우가 열려 있으면 닫기
//             if (currentInfowindow) {
//                 currentInfowindow.close();
//             }

//             // 인포메이션 윈도우를 새로운 목적지 마커 위에 표시
//             infowindow.open(map, destinationMarker);

//             // 현재 열려 있는 인포메이션 윈도우를 저장
//             currentInfowindow = infowindow;

//             // 경로 UI를 초기화하고 숨기기
//             if (currentPolyline) {
//                 currentPolyline.setMap(null); // 기존 경로 숨기기
//                 currentPolyline = null; // 현재 폴리라인 변수 초기화
//             }
//             document.getElementById('result').innerHTML = ''; // 결과 UI 초기화
//         } else {
//             alert("주소를 찾을 수 없습니다.");
//         }
//     });
// }

    


//     // 경로 검색 함수
//     function geocodeAndFindRoute(start, end) {
//         geocoder.addressSearch(start, function (result, status) {
//             if (status === kakao.maps.services.Status.OK) {
//                 var startCoords = new kakao.maps.LatLng(result[0].y, result[0].x);
    
//                 // 출발지 마커 표시
//                 var startMarker = new kakao.maps.Marker({
//                     position: startCoords,
//                     image: new kakao.maps.MarkerImage('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', new kakao.maps.Size(30, 40))
//                 });
//                 startMarker.setMap(map);
    
//                 geocoder.addressSearch(end, function (result, status) {
//                     if (status === kakao.maps.services.Status.OK) {
//                         var endCoords = new kakao.maps.LatLng(result[0].y, result[0].x);
//                         findRoute(startCoords, endCoords);
//                     } else {
//                         alert('목적지 주소 변환에 실패했습니다.');
//                         hideLoadingModal(); // 로딩 모달 숨김
//                     }
//                 });
//             } else {
//                 alert('출발지 주소 변환에 실패했습니다.');
//                 hideLoadingModal(); // 로딩 모달 숨김
//             }
//         });
//     }
    
//     // 경로 찾기 함수
//     function findRoute(startCoords, endCoords) {
//         var apiUrl = `https://apis-navi.kakaomobility.com/v1/directions?origin=${startCoords.getLng()},${startCoords.getLat()}&destination=${endCoords.getLng()},${endCoords.getLat()}&priority=RECOMMEND&vehicle=car`;
    
//         fetch(apiUrl, {
//             headers: {
//                 "Authorization": "KakaoAK 8e2c134c22f8c379da88ce3fc7bc85a4"
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             var route = data.routes[0];
//             var distance = route.summary.distance;
//             var duration = route.summary.duration;
    
//             // 소요 시간을 시와 분으로 변환
//             var hours = Math.floor(duration / 3600); // 시
//             var minutes = Math.floor((duration % 3600) / 60); // 분
    
//             hideLoadingModal(); // 로딩 모달 숨김
    
//             document.getElementById('result').innerHTML = `
//                 <div class="cl-1-input ">
//                     <label class="cl-1-label">거리</label>
//                     <div class="cl-1-input-text">${(distance / 1000).toFixed(1)} km</div>
//                 </div>
//                 <div class="cl-1-input ">
//                     <label class="cl-1-label">시간</label>
//                     <div class="cl-1-input-text">${hours}시간 ${minutes}분</div>
//                 </div>                
//             `;
    
//             // 경로 표시
//             var path = route.sections[0].roads.reduce(function (acc, road) {
//                 road.vertexes.forEach(function (vertex, index) {
//                     if (index % 2 === 0) {
//                         acc.push(new kakao.maps.LatLng(road.vertexes[index + 1], vertex));
//                     }
//                 });
//                 return acc;
//             }, []);
    
//             // 이전 경로 삭제
//             if (currentPolyline) {
//                 currentPolyline.setMap(null); // 기존 경로 삭제
//             }
    
//             // 새로운 경로 표시
//             currentPolyline = new kakao.maps.Polyline({
//                 path: path,
//                 strokeWeight: 6,
//                 strokeColor: '#00BFFF',
//                 strokeOpacity: 0.8
//             });
//             currentPolyline.setMap(map);
    
//             // 지도의 범위를 경로에 맞게 조정
//             var bounds = new kakao.maps.LatLngBounds();
//             path.forEach(function (latlng) {
//                 bounds.extend(latlng);
//             });
//             map.setBounds(bounds);
    
//             // 목적지 마커 표시
//             var endAddress = document.getElementById('end').value; // 사용자가 입력한 목적지 주소
//             var destinationPlace = placesData.find(place => place.address === endAddress);
    
//             if (destinationPlace) {
//                 if (destinationMarker) {
//                     destinationMarker.setMap(null); // 이전 마커 숨기기
//                 }
//                 // 새로운 목적지 마커 생성
//                 destinationMarker = new kakao.maps.Marker({
//                     position: endCoords // 목적지 좌표
//                 });
//                 destinationMarker.setMap(map); // 목적지 마커 표시
//             } else {
//                 alert('목적지 정보가 없습니다.');
//             }
//         })
//         .catch(error => {
//             console.error('경로 검색 중 오류 발생:', error);
//             hideLoadingModal(); // 로딩 모달 숨김
//         });
//     }
    
//     // 로딩 모달 표시 함수
//     function showLoadingModal() {
//         document.getElementById('loadingModal').style.display = 'flex';
//     }
    
//     // 로딩 모달 숨김 함수
//     function hideLoadingModal() {
//         document.getElementById('loadingModal').style.display = 'none';
//     }
    


var placesData = []; // JSON 데이터를 저장할 변수
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
        displayPlaces(placesData); // 전체 장소 리스트 표시
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

// 장소 리스트 표시 함수
function displayPlaces(filteredPlaces) {
    var placesList = document.getElementById('places');
    placesList.innerHTML = ''; // 기존 목록 초기화

    filteredPlaces.forEach(function (place) {
        var li = document.createElement('li');
        li.innerHTML = `
            <div class="li-container" onclick="setDestination('${place.title}', '${place.address}', '${place.area}')">
                <div class="li-eclipse">${place.area}</div>
                <div class="li-textWrap">
                    <div class="li-text-title">${place.title}</div>
                    <div class="li-text-address">${place.address}</div>
                </div>
            </div>
        `;
        placesList.appendChild(li);

        // 장소에 마커 표시
        geocoder.addressSearch(place.address, function (result, status) {
            if (status === kakao.maps.services.Status.OK) {
                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                var placeMarker = new kakao.maps.Marker({
                    position: coords
                });
                placeMarker.setMap(map);

                var infowindowContent = `
                <div class="marker-info">
                    <div>
                        <span>${place.title}&nbsp;&nbsp;
                            <a href="${place.url}" target="_blank">
                                <i class="fas fa-chevron-right"></i>
                            </a>
                        </span>
                    </div>
                </div>
                `;
                var infowindow = new kakao.maps.InfoWindow({
                    content: infowindowContent,
                    removable: true
                });

                kakao.maps.event.addListener(placeMarker, 'click', function () {
                    infowindow.open(map, placeMarker);
                });

                placeMarkers.push(placeMarker);
            }
        });
    });
}

// 검색어 필터링 함수
function filterPlaces(keyword) {
    if (keyword === '') {
        displayPlaces(placesData); // 검색어가 없으면 전체 장소 표시
    } else {
        var filteredPlaces = placesData.filter(function (place) {
            return place.title.includes(keyword) || place.address.includes(keyword);
        });
        displayPlaces(filteredPlaces);
    }
}

// 검색 입력 이벤트 리스너 추가
document.getElementById('searchInput').addEventListener('input', function () {
    var keyword = this.value;
    filterPlaces(keyword);
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

// 목적지 설정 함수
function setDestination(title, address, url) {
    document.getElementById('end').value = address;

    geocoder.addressSearch(address, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            if (destinationMarker) {
                destinationMarker.setMap(null); // 이전 마커 숨기기
            }

            destinationMarker = new kakao.maps.Marker({
                position: coords
            });
            destinationMarker.setMap(map);
            map.setCenter(coords);

            var infowindowContent = `
                <div class="marker-info">    
                    <div>
                        <span>${title}&nbsp;&nbsp;
                            <a href="${url}" target="_blank">
                                <i class="fas fa-chevron-right"></i>
                            </a>
                        </span>
                    </div>
                </div>
            `;
            var infowindow = new kakao.maps.InfoWindow({
                content: infowindowContent,
                removable: true
            });

            if (currentInfowindow) {
                currentInfowindow.close();
            }

            infowindow.open(map, destinationMarker);
            currentInfowindow = infowindow;

            if (currentPolyline) {
                currentPolyline.setMap(null); // 기존 경로 숨기기
                currentPolyline = null;
            }
            document.getElementById('result').innerHTML = ''; // 결과 초기화
        } else {
            alert("주소를 찾을 수 없습니다.");
        }
    });
}

// 경로 검색 및 표시 함수
function geocodeAndFindRoute(start, end) {
    geocoder.addressSearch(start, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var startCoords = new kakao.maps.LatLng(result[0].y, result[0].x);

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

// 경로 찾기 및 표시 함수
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

        var hours = Math.floor(duration / 3600);
        var minutes = Math.floor((duration % 3600) / 60);

        hideLoadingModal();

        document.getElementById('result').innerHTML = `
            <div class="cl-1-input ">
                <div class="cl-1-result">총 거리: ${distance} m</div>
                <div class="cl-1-result">총 시간: ${hours}시간 ${minutes}분</div>
            </div>
        `;

        var path = [];
        route.sections.forEach(function (section) {
            section.roads.forEach(function (road) {
                road.vertexes.forEach(function (vertex, index) {
                    if (index % 2 === 0) {
                        path.push(new kakao.maps.LatLng(road.vertexes[index + 1], vertex));
                    }
                });
            });
        });

        if (currentPolyline) {
            currentPolyline.setMap(null); // 이전 경로 숨기기
        }

        currentPolyline = new kakao.maps.Polyline({
            path: path,
            strokeWeight: 5,
            strokeColor: '#ff0000',
            strokeOpacity: 0.7,
            strokeStyle: 'solid'
        });

        currentPolyline.setMap(map);
        map.setBounds(new kakao.maps.LatLngBounds(startCoords, endCoords)); // 경로가 화면에 맞게 조정
    })
    .catch(error => {
        console.error('경로 요청 중 오류 발생:', error);
        hideLoadingModal(); // 로딩 모달 숨김
        alert('경로를 찾는 중 오류가 발생했습니다.');
    });
}

// 로딩 모달 표시 함수
function showLoadingModal() {
    document.getElementById('loadingModal').style.display = 'block';
}

// 로딩 모달 숨기기 함수
function hideLoadingModal() {
    document.getElementById('loadingModal').style.display = 'none';
}
