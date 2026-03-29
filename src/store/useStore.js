import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export const useStore = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const jobsData = snapshot.docs.map(doc => doc.data());
      // Sort jobs by createdAt descending
      jobsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setJobs(jobsData);
    });

    return () => unsubscribe();
  }, []);

  const addJob = async (jobData) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    
    // Generate unique index for the day
    const todaysJobs = jobs.filter(j => j.id && j.id.includes(dateStr));
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

    try {
      await setDoc(doc(db, 'jobs', newId), newJob);
      return newId;
    } catch (error) {
      console.error("Error adding job: ", error);
      throw error;
    }
  };

  const updateJobStatus = async (id, newStatus) => {
    const jobToUpdate = jobs.find(job => job.id === id);
    if (!jobToUpdate) return;

    const newTimeline = [...(jobToUpdate.timeline || []), { status: newStatus, date: new Date().toISOString() }];

    try {
      await updateDoc(doc(db, 'jobs', id), {
        status: newStatus,
        timeline: newTimeline
      });
    } catch (error) {
      console.error("Error updating job status: ", error);
    }
  };

  const processPayment = async (id, paymentData) => {
    try {
      await updateDoc(doc(db, 'jobs', id), {
        payment: { ...paymentData, date: new Date().toISOString() }
      });
    } catch (error) {
      console.error("Error processing payment: ", error);
    }
  };

  const getJob = (id) => jobs.find(j => j.id === id);

  const deleteJob = async (id) => {
    try {
      await deleteDoc(doc(db, 'jobs', id));
    } catch (error) {
      console.error("Error deleting job: ", error);
    }
  };

  return { jobs, addJob, updateJobStatus, processPayment, getJob, deleteJob };
};
