import { useState, useEffect } from 'react';

const STORAGE_KEY = 'repair_jobs';

// Initial dummy data
const initialJobs = [
  {
    id: 'JS-20240321-001',
    customerName: 'John Doe',
    whatsapp: '9876543210',
    brand: 'Apple',
    model: 'iPhone 13',
    imei: '358123456789012',
    problem: 'Screen cracked',
    quotedPrice: 150,
    status: 'Received',
    createdAt: new Date().toISOString(),
    timeline: [
      { status: 'Received', date: new Date().toISOString() }
    ],
    payment: null
  }
];

export const useStore = () => {
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialJobs;
      }
    }
    return initialJobs;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  const addJob = (jobData) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    
    // Generate unique index for the day
    const todaysJobs = jobs.filter(j => j.id.includes(dateStr));
    const nextIdx = String(todaysJobs.length + 1).padStart(3, '0');
    const newId = `JS-${dateStr}-${nextIdx}`;

    const newJob = {
      ...jobData,
      id: newId,
      status: 'Received',
      createdAt: today.toISOString(),
      timeline: [{ status: 'Received', date: today.toISOString() }],
      payment: null
    };

    setJobs(prev => [newJob, ...prev]);
    return newId;
  };

  const updateJobStatus = (id, newStatus) => {
    setJobs(prev => prev.map(job => {
      if (job.id === id) {
        return {
          ...job,
          status: newStatus,
          timeline: [...job.timeline, { status: newStatus, date: new Date().toISOString() }]
        };
      }
      return job;
    }));
  };

  const processPayment = (id, paymentData) => {
    setJobs(prev => prev.map(job => {
      if (job.id === id) {
        return {
          ...job,
          payment: { ...paymentData, date: new Date().toISOString() }
        };
      }
      return job;
    }));
  };

  const getJob = (id) => jobs.find(j => j.id === id);

  const deleteJob = (id) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  return { jobs, addJob, updateJobStatus, processPayment, getJob, deleteJob };
};
