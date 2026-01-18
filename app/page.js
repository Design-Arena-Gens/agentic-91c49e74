'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [location, setLocation] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          setLocation({ latitude: 24.7136, longitude: 46.6753 }); // Riyadh default
        }
      );
    } else {
      setLocation({ latitude: 24.7136, longitude: 46.6753 }); // Riyadh default
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetchPrayerTimes();
    }
  }, [location]);

  useEffect(() => {
    if (prayerTimes) {
      calculateNextPrayer();
    }
  }, [prayerTimes, currentTime]);

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true);
      const date = new Date();
      const timestamp = Math.floor(date.getTime() / 1000);

      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${location.latitude}&longitude=${location.longitude}&method=4`
      );
      const data = await response.json();

      if (data.code === 200) {
        setPrayerTimes(data.data.timings);
        setError(null);
      } else {
        setError('فشل في جلب مواقيت الصلاة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPrayer = () => {
    const prayers = [
      { name: 'الفجر', time: prayerTimes.Fajr },
      { name: 'الشروق', time: prayerTimes.Sunrise },
      { name: 'الظهر', time: prayerTimes.Dhuhr },
      { name: 'العصر', time: prayerTimes.Asr },
      { name: 'المغرب', time: prayerTimes.Maghrib },
      { name: 'العشاء', time: prayerTimes.Isha }
    ];

    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':');
      const prayerMinutes = parseInt(hours) * 60 + parseInt(minutes);

      if (prayerMinutes > currentMinutes) {
        const diff = prayerMinutes - currentMinutes;
        const hoursLeft = Math.floor(diff / 60);
        const minutesLeft = diff % 60;
        setNextPrayer({
          name: prayer.name,
          time: prayer.time,
          remaining: `${hoursLeft}:${minutesLeft.toString().padStart(2, '0')}`
        });
        return;
      }
    }

    const [hours, minutes] = prayers[0].time.split(':');
    const prayerMinutes = parseInt(hours) * 60 + parseInt(minutes);
    const diff = (24 * 60 - currentMinutes) + prayerMinutes;
    const hoursLeft = Math.floor(diff / 60);
    const minutesLeft = diff % 60;
    setNextPrayer({
      name: prayers[0].name,
      time: prayers[0].time,
      remaining: `${hoursLeft}:${minutesLeft.toString().padStart(2, '0')}`
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>مواقيت الصلاة</h1>
        <div style={styles.currentTime}>
          {currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div style={styles.date}>
          {currentTime.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {nextPrayer && (
        <div style={styles.nextPrayerCard}>
          <div style={styles.nextPrayerLabel}>الصلاة القادمة</div>
          <div style={styles.nextPrayerName}>{nextPrayer.name}</div>
          <div style={styles.nextPrayerTime}>{formatTime(nextPrayer.time)}</div>
          <div style={styles.countdown}>بعد {nextPrayer.remaining}</div>
        </div>
      )}

      <div style={styles.prayersGrid}>
        {prayerTimes && [
          { name: 'الفجر', time: prayerTimes.Fajr, icon: '🌅' },
          { name: 'الشروق', time: prayerTimes.Sunrise, icon: '☀️' },
          { name: 'الظهر', time: prayerTimes.Dhuhr, icon: '🌞' },
          { name: 'العصر', time: prayerTimes.Asr, icon: '🌤️' },
          { name: 'المغرب', time: prayerTimes.Maghrib, icon: '🌆' },
          { name: 'العشاء', time: prayerTimes.Isha, icon: '🌙' }
        ].map((prayer, index) => (
          <div key={index} style={styles.prayerCard}>
            <div style={styles.prayerIcon}>{prayer.icon}</div>
            <div style={styles.prayerName}>{prayer.name}</div>
            <div style={styles.prayerTime}>{formatTime(prayer.time)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  header: {
    textAlign: 'center',
    color: 'white',
    marginBottom: '30px'
  },
  title: {
    fontSize: '2.5rem',
    margin: '20px 0',
    fontWeight: 'bold'
  },
  currentTime: {
    fontSize: '2rem',
    marginBottom: '10px',
    fontWeight: '600'
  },
  date: {
    fontSize: '1.1rem',
    opacity: 0.9
  },
  nextPrayerCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '30px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    minWidth: '300px',
    maxWidth: '400px',
    width: '100%'
  },
  nextPrayerLabel: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '10px'
  },
  nextPrayerName: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '10px'
  },
  nextPrayerTime: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  },
  countdown: {
    fontSize: '1.2rem',
    color: '#764ba2',
    fontWeight: '600'
  },
  prayersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    maxWidth: '900px',
    width: '100%'
  },
  prayerCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    textAlign: 'center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer'
  },
  prayerIcon: {
    fontSize: '2.5rem',
    marginBottom: '10px'
  },
  prayerName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px'
  },
  prayerTime: {
    fontSize: '1.5rem',
    color: '#667eea',
    fontWeight: '600'
  },
  loading: {
    color: 'white',
    fontSize: '1.5rem',
    textAlign: 'center',
    marginTop: '50px'
  },
  error: {
    color: 'white',
    fontSize: '1.5rem',
    textAlign: 'center',
    marginTop: '50px',
    background: 'rgba(255,0,0,0.2)',
    padding: '20px',
    borderRadius: '10px'
  }
};
