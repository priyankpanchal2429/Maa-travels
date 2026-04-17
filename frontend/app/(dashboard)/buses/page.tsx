'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Plus, Bus as BusIcon, Edit, Trash2, Power, 
  Wrench, Search, Filter, ShieldAlert, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { useUI } from '@/context/UIContext';
import busService, { Bus, BusStatus } from '@/services/busService';
import Button from '@/components/ui/Button/Button';
import Spinner from '@/components/ui/Spinner/Spinner';
import BusForm from '@/components/buses/BusForm';
import styles from './page.module.css';

const statusConfig = {
  idle: { label: 'Idle', color: '#64748b', icon: <Power size={14} /> },
  running: { label: 'Running', color: '#10b981', icon: <Power size={14} className={styles.spin} /> },
  maintenance: { label: 'Repairs', color: '#f59e0b', icon: <Wrench size={14} /> },
};

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { openDrawer, closeDrawer, showToast } = useUI();

  const fetchBuses = useCallback(async () => {
    try {
      const { data } = await busService.getAll();
      setBuses(data.data);
    } catch {
      showToast('Error loading buses', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const matchesSearch = 
        bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || bus.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [buses, searchQuery, statusFilter]);

  const getComplianceAlerts = (bus: Bus) => {
    const alerts = [];
    const now = new Date();
    const threshold = 30; 

    const check = (dateStr: string | undefined, label: string) => {
      if (!dateStr) return null;
      const expiry = new Date(dateStr);
      const diff = expiry.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      if (days < 0) return { label, status: 'expired', days };
      if (days <= threshold) return { label, status: 'warning', days };
      return null;
    };

    const rc = check(bus.rcExpiry, 'RC');
    const ins = check(bus.insuranceExpiry, 'Insurance');
    const pmt = check(bus.permitExpiry, 'Permit');
    const fit = check(bus.fitnessExpiry, 'Fitness');

    if (rc) alerts.push(rc);
    if (ins) alerts.push(ins);
    if (pmt) alerts.push(pmt);
    if (fit) alerts.push(fit);

    return alerts;
  };

  const handleCreate = () => {
    openDrawer(
      <BusForm 
        onSuccess={() => {
          closeDrawer();
          fetchBuses();
          showToast('Added', 'success');
        }} 
      />
    );
  };

  const handleEdit = (bus: Bus) => {
    openDrawer(
      <BusForm 
        initialData={bus}
        onSuccess={() => {
          closeDrawer();
          fetchBuses();
          showToast('Updated', 'success');
        }} 
      />
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this bus?')) {
      try {
        await busService.delete(id);
        fetchBuses();
        showToast('Deleted', 'success');
      } catch {
        showToast('Error deleting', 'error');
      }
    }
  };

  const toggleStatus = async (bus: Bus) => {
    const nextStatus: { [key in BusStatus]: BusStatus } = {
      idle: 'running',
      running: 'maintenance',
      maintenance: 'idle'
    };
    
    try {
      await busService.update(bus._id, { status: nextStatus[bus.status] });
      fetchBuses();
      showToast(`Status changed to ${statusConfig[nextStatus[bus.status]].label}`, 'info');
    } catch {
      showToast('Error changing status', 'error');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="text-gradient">Buses</h1>
          <p className={styles.subtitle}>{filteredBuses.length} {filteredBuses.length === 1 ? 'bus' : 'buses'} listed</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Add Bus
        </Button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by number or plate..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterWrap}>
            <Filter size={16} className={styles.filterIcon} />
            <span className={styles.filterLabel}>Status</span>
            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Any Status</option>
              <option value="running">Running</option>
              <option value="idle">Idle</option>
              <option value="maintenance">Repairs</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loader}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredBuses.map((bus) => {
            const complianceAlerts = getComplianceAlerts(bus);
            return (
              <div key={bus._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconBox}>
                    <BusIcon size={24} />
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => handleEdit(bus)} className={styles.actionBtn}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(bus._id)} className={styles.actionBtnDelete}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.busInfo}>
                  <h3 className={styles.busNumber}>{bus.busNumber}</h3>
                  <p className={styles.plateNumber}>{bus.plateNumber}</p>
                </div>

                <div className={styles.detailsRow}>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Seats</span>
                    <span className={styles.detailValue}>{bus.capacity}</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Driver</span>
                    <span className={styles.detailValue}>
                      {bus.currentDriverId ? 'Assigned' : <span className={styles.unassigned}>None</span>}
                    </span>
                  </div>
                </div>

                {complianceAlerts.length > 0 && (
                  <div className={styles.complianceAlerts}>
                    {complianceAlerts.map((alert, idx) => (
                      <div 
                        key={idx} 
                        className={[styles.complianceBadge, alert.status === 'warning' ? styles.warning : ''].join(' ')}
                        title={`${alert.label} expires on ${alert.days < 0 ? 'Previously' : 'In ' + alert.days + ' days'}`}
                      >
                        <ShieldAlert size={12} className={alert.status === 'expired' ? styles.pulsingIcon : ''} />
                        <span>{alert.label} {alert.status === 'expired' ? 'Expired' : 'Renewal'}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.statusSection}>
                  <div 
                    className={styles.statusBadge} 
                    style={{ '--status-color': statusConfig[bus.status].color } as any}
                    onClick={() => toggleStatus(bus)}
                    title="Click to toggle status"
                  >
                    {statusConfig[bus.status].icon}
                    <span>{statusConfig[bus.status].label}</span>
                  </div>
                  <p className={styles.statusHint}>Click to change</p>
                </div>
              </div>
            );
          })}

          {filteredBuses.length === 0 && (
            <div className={styles.empty}>
              <BusIcon size={48} className={styles.emptyIcon} />
              <h3>{searchQuery || statusFilter !== 'all' ? 'No matches' : 'No buses'}</h3>
              <p>
                {searchQuery || statusFilter !== 'all'
                  ? 'Try searching for something else.'
                  : 'Add your first bus to the list.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button variant="secondary" onClick={handleCreate}>Add Bus</Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
