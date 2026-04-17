import React, { useEffect, useState } from 'react';
import { 
  CreditCard, UserPlus, Bus, IndianRupee, 
  Settings, Clock, ChevronRight 
} from 'lucide-react';
import activityService, { ActivityLog } from '@/services/activityService';
import Spinner from '@/components/ui/Spinner/Spinner';
import styles from './ActivityPulse.module.css';

const typeConfig = {
  student: { icon: <UserPlus size={16} />, color: '#f59e0b' },
  payment: { icon: <IndianRupee size={16} />, color: '#10b981' },
  fleet: { icon: <Bus size={16} />, color: '#3b82f6' },
  expense: { icon: <CreditCard size={16} />, color: '#ef4444' },
  system: { icon: <Settings size={16} />, color: '#a1a1aa' },
};

const ActivityPulse = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data } = await activityService.getRecent(10);
        setActivities(data.data);
      } catch (err) {
        console.error('Pulse Sync Error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) return (
    <div className={styles.loaderWrap}>
      <Spinner size="sm" />
    </div>
  );

  return (
    <div className={styles.pulseBox}>
      <div className={styles.pulseHeader}>
        <div className={styles.titleGroup}>
          <Clock size={16} className={styles.pulseIcon} />
          <h3>Recent Actions</h3>
        </div>
        <span className={styles.liveIndicator}>Live</span>
      </div>

      <div className={styles.feed}>
        {activities.map((act) => {
          const config = typeConfig[act.type] || typeConfig.system;
          return (
            <div key={act._id} className={styles.feedItem}>
              <div 
                className={styles.itemIcon} 
                style={{ background: `${config.color}20`, color: config.color }}
              >
                {config.icon}
              </div>
              <div className={styles.itemContent}>
                <p className={styles.message}>{act.message}</p>
                <span className={styles.time}>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Today</span>
              </div>
            </div>
          );
        })}

        {activities.length === 0 && (
          <div className={styles.empty}>
            <p>No actions found.</p>
          </div>
        )}
      </div>

      <button className={styles.viewAllBtn}>
        See All <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default ActivityPulse;
