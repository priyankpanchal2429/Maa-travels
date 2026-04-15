'use client';

import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Student } from '@/services/studentService';
import { Bus as BusIcon, MapPin } from 'lucide-react';
import styles from './StudentPass.module.css';

interface StudentPassProps {
  student: Student;
}

const StudentPass: React.FC<StudentPassProps> = ({ student }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High quality
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // jsPDF dimensions in mm (standard credit card)
      const pdf = new jsPDF('l', 'mm', [85.6, 53.98]);
      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
      pdf.save(`Pass_${student.studentId}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div id={`pass-${student._id}`} className={styles.card} ref={cardRef}>
        <div className={styles.header}>
          <div className={styles.brand}>
            <BusIcon size={16} />
            <span>Maa Travels</span>
          </div>
          <div className={styles.passType}>Bus Pass</div>
        </div>

        <div className={styles.body}>
          <div className={styles.photoWrap}>
            {student.photo ? (
              <img src={student.photo} alt={student.name} className={styles.photo} />
            ) : (
              <div className={styles.photoPlaceholder}>Photo</div>
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.name}>{student.name}</div>
            <div className={styles.id}>{student.studentId}</div>
            
            <div className={styles.routeInfo}>
              <div className={styles.routeRow}>
                <MapPin size={8} />
                <span>{typeof student.routeId === 'object' ? student.routeId.routeName : 'Default Route'}</span>
              </div>
              <div className={styles.stopName}>{student.stopId}</div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.validity}>
            Valid Until: {new Date(student.expiryDate).toLocaleDateString()}
          </div>
          <div className={styles.indicator}>
            {student.paymentStatus.toUpperCase()}
          </div>
        </div>
        
        {/* Chips for design detail */}
        <div className={styles.chip} />
        <div className={styles.goldLine} />
      </div>

      <button className={styles.downloadBtn} onClick={handleDownload}>
        Download PDF Pass
      </button>
    </div>
  );
};

export default StudentPass;
