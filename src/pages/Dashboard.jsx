import { useState } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Send, Eye, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { jobs } = useStore();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Default to first of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const isWithinTimeframe = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d >= start && d <= end;
  };

  const jobsInPeriod = jobs.filter(j => isWithinTimeframe(j.createdAt));

  const stats = {
    total: jobsInPeriod.length,
    pending: jobsInPeriod.filter(j => j.status !== 'Delivered').length,
    completed: jobs.filter(j => j.status === 'Completed' && j.timeline.find(t => t.status === 'Completed') && isWithinTimeframe(j.timeline.find(t => t.status === 'Completed').date)).length,
    revenue: jobs.filter(j => j.payment && isWithinTimeframe(j.payment.date)).reduce((sum, j) => sum + Number(j.payment.amount), 0)
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Received': return 'badge-info';
      case 'In Repair': return 'badge-warning';
      case 'Completed': return 'badge-success';
      case 'Delivered': return 'badge-default';
      default: return 'badge-default';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-4 items-center bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <Calendar className="w-5 h-5 text-slate-400" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-slate-500">From</span>
            <input type="date" className="border-none outline-none font-bold text-slate-700 bg-transparent cursor-pointer" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="text-slate-300">|</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-slate-500">To</span>
            <input type="date" className="border-none outline-none font-bold text-slate-700 bg-transparent cursor-pointer" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="text-muted font-bold mb-2 uppercase text-sm">Total Jobs</div>
          <div className="text-2xl">{stats.total}</div>
        </div>
        <div className="card">
          <div className="text-muted font-bold mb-2 uppercase text-sm">Pending Repairs</div>
          <div className="text-2xl">{stats.pending}</div>
        </div>
        <div className="card">
          <div className="text-muted font-bold mb-2 uppercase text-sm">Completed</div>
          <div className="text-2xl">{stats.completed}</div>
        </div>
        <div className="card">
          <div className="text-muted font-bold mb-2 uppercase text-sm">Revenue</div>
          <div className="text-2xl">₹{stats.revenue.toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl mb-4">Recent Jobs</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Job Sheet</th>
                <th>Customer Name</th>
                <th>Device</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.slice(0, 10).map(job => (
                <tr key={job.id} className="clickable" onClick={() => navigate(`/jobs/${job.id}`)}>
                  <td className="font-bold">{job.id}</td>
                  <td>{job.customerName}</td>
                  <td>{job.brand} {job.model}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(job.status)}`}>{job.status}</span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button className="btn btn-outline" onClick={() => navigate(`/jobs/${job.id}`)}>
                        <Eye className="w-4 h-4" /> View
                      </button>
                      {job.status === 'Delivered' && (
                        <button className="btn btn-primary" onClick={() => alert('Sending Invoice to WhatsApp...')}>
                          <Send className="w-4 h-4" /> Invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted">No jobs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
