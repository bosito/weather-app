import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'reactstrap';
import Lottie from 'react-lottie';
import animationAccessFalse from './lottie/13865-sign-for-error-flat-style.json';
import animationLoading from './lottie/lf30_editor_0htqx0oh.json';
import animationDay from './lottie/9646-day-with-night-animation.json';
import animationRain from './lottie/64960-rainy-icon.json';
import './App.css';

export default function App() {

  const [locationAccess, setLocationAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [askAgain, setAskAgain] = useState(false);


  const accessLocation = () => {
    navigator.geolocation.getCurrentPosition((location) => {
      setLoading(false);
      setLocationAccess(true);
      setLocationData([location.coords]);
    }, (err) => {
      console.warn(err)
      setLoading(false);
      setLocationAccess(false);
    });
  };

  const apiFech = async (latitude, longitude) => {
    try {
      const uri = `https://api.weatherapi.com/v1/current.json?key=031baf7d881040b0bb1190716210307&q=${latitude},${longitude}`
      const responseApi = await fetch(uri)
        .then((response) => response.json())
      setWeatherData(responseApi);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setLoading(true);
    setLocationData([]);
    if (navigator.geolocation) {
      accessLocation();
    } else {
      alert("Parece que no podemos acceder a tu GEO")
    }
  }, [askAgain]);

  useEffect(() => {
    if (locationData.length > 0) {
      const latitude = locationData[0].latitude
      const longitude = locationData[0].longitude
      if (latitude && longitude) {
        apiFech(latitude, longitude);
      }
    }
  }, [locationData]);

  return (
    <div>
      {
        loading ? (
          <LoadingView />
        )
          : locationAccess ? (
            <AccessView weatherData={weatherData} />
          ) : (
            <AcceseNegate setAskAgain={setAskAgain} />
          )
      }
    </div>
  )
}

function AccessView(props) {
  const { weatherData } = props;
  const ContainerTimeRef = useRef();
  const [isPaused, setIsPaused] = useState(false);
  const [convierte, setConvierte] = useState(false);
  /*se supone que la idea es que cheque cuando al api diga que esta
  lloviendo pero no se que diga exacctamente (string) por lo que mantendre oculto 
  setIsRain hasta que revice el api y vea que me trae el strin que menciona a la lluvia
  */
  const [isRain] = useState(false);

  const isDay = (event) => {
    //dia
    const time = new Date(weatherData.location.localtime)
    const horas = time.getHours();
    if (horas > 7) {
      const diaVideo = event.totalTime / 5;
      // console.log(diaVideo);
      // console.log(event.currentTime);
      if (diaVideo <= event.currentTime) {
        ContainerTimeRef.current.className = "containerWeatherAnimation";
        setIsPaused(true);
        return
      }
    }
    //noche
    if (horas > 18) {
      const diaVideo = event.totalTime;
      if (diaVideo <= event.currentTime) {
        ContainerTimeRef.current.className = "containerWeather";
        setIsPaused(true);
        return
      }
    }
  }

  return (
    <>
      {
        weatherData ? (
          <div className="containerWeather" ref={ContainerTimeRef} >
            <div className="containerLottieDay">
              <Lottie
                eventListeners={[{
                  eventName: 'enterFrame',
                  callback: (e) => isDay(e)
                }]}
                options={{
                  loop: false,
                  autoplay: true,
                  animationData: animationDay,
                  rendererSettings: {
                    preserveAspectRatio: 'xMidYMid slice'
                  }
                }}
                isStopped={false}
                isPaused={isPaused}
                height
                width
              />
            </div>
            <div style={isRain ? null  : { display: 'none' }}>
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: animationRain,
                  rendererSettings: {
                    preserveAspectRatio: 'xMidYMid slice'
                  }
                }}
                isStopped={false}
                isPaused={false}
                height={200}
                width={200}
              />
            </div>

            <div className="cardContainer" >
              <div className="cardPrincipal">
                <h2 className="txtitle">{weatherData.location.country} {weatherData.location.name} {weatherData.location.region}</h2>
                <p className="txt">{weatherData.location.localtime}</p>
                <p className="txt">{weatherData.current.condition.text}</p>
                <img className="imageStyle" src={weatherData.current.condition.icon} alt="Card cap" />
                {
                  convierte ? (
                    <p className="txt">Temperatura °C: {weatherData.current.feelslike_c}</p>
                  ) : (
                    <p className="txt">Temperatura °F: {weatherData.current.feelslike_f}</p>
                  )
                }
                <Button color="info" onClick={() => setConvierte(!convierte)}>convertir F° a  C°</Button>
                <p className="txt">Humedad: {weatherData.current.humidity}%</p>
              </div>
            </div>
          </div>
        ) : (
          <LoadingView />
        )
      }
    </>
  )
}

function AcceseNegate({ setAskAgain }) {
  return (
    <div className="backgroundFalse">
      <Lottie
        options={{
          loop: false,
          autoplay: true,
          animationData: animationAccessFalse,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
          }
        }}
        isStopped={false}
        isPaused={false}
        height={400}
        width={400}
      />
      <div className="centerNoAccess">
        <p>No tenemos permiso de acceder a tu localizacion</p>
        <Button onClick={()=>setAskAgain(true)}>preguntar de nuevo</Button>
      </div>
    </div>
  );
};

function LoadingView() {
  return (
    <div className="containerLoading">
      <Lottie
        options={{
          loop: true,
          autoplay: true,
          animationData: animationLoading,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
          }
        }}
        isStopped={false}
        isPaused={false}
        height={400}
        width={400}
      />
      <div className="centerNoAccess">
        <p style={{ fontSize: 30 }}>cargando . . .</p>
      </div>
    </div>
  )
};