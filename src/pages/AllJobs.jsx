import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Send, Download } from 'lucide-react';

export default function AllJobs() {
  const { jobs } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.whatsapp.includes(searchTerm);
      
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Received': return 'badge-info';
      case 'In Repair': return 'badge-warning';
      case 'Completed': return 'badge-success';
      case 'Delivered': return 'badge-default';
      default: return 'badge-default';
    }
  };

  const handleWhatsAppInvoice = (job) => {
    if (!job.payment) {
      alert('Payment not completed for this job yet.');
      return;
    }
    const text = `Hello ${job.customerName},\n\nThank you for choosing us! Your device (${job.brand} ${job.model}) has been delivered.\n\nInvoice Details:\nJob Sheet: ${job.id}\nAmount Paid: ₹${job.payment.amount}\nPayment Mode: ${job.payment.mode}\n\nThank you!\n\nThink Privacy First | Phonefix`;
    window.open(`https://wa.me/${job.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleExportCSV = () => {
    const headers = ['Job Sheet', 'Date', 'Customer Name', 'WhatsApp', 'Brand', 'Model', 'Problem', 'Quoted Price', 'Status', 'Payment Amount', 'Payment Mode', 'Payment Date'];
    const csvContent = [
      headers.join(','),
      ...jobs.map(job => [
        job.id,
        new Date(job.createdAt).toLocaleDateString(),
        `"${job.customerName}"`,
        job.whatsapp,
        job.brand,
        job.model,
        `"${job.problem.replace(/"/g, '""')}"`,
        job.quotedPrice,
        job.status,
        job.payment ? job.payment.amount : '',
        job.payment ? job.payment.mode : '',
        job.payment ? new Date(job.payment.date).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'phonefix_jobs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Jobs</h1>
        <button className="btn btn-outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="card mb-6 flex gap-4 items-center">
        <div className="flex-1 form-group mb-0 relative">
          <label className="form-label sr-only">Search</label>
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-muted" />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by name, phone, or job sheet..." 
            value={searchTerm}
            style={{ paddingLeft: '2.5rem'}}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-64 form-group mb-0">
          <label className="form-label sr-only">Status Filter</label>
          <select 
            className="form-control"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Received">Received</option>
            <option value="In Repair">In Repair</option>
            <option value="Completed">Completed</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Job Sheet</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Device</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? filteredJobs.map(job => (
                <tr key={job.id} className="clickable" onClick={() => navigate(`/jobs/${job.id}`)}>
                  <td className="font-bold">{job.id}</td>
                  <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div>{job.customerName}</div>
                    <div className="text-muted text-sm">{job.whatsapp}</div>
                  </td>
                  <td>{job.brand} {job.model}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(job.status)}`}>{job.status}</span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button className="btn btn-outline" onClick={() => navigate(`/jobs/${job.id}`)}>
                         View
                      </button>
                      {job.status === 'Delivered' && (
                        <button className="btn btn-primary" onClick={() => handleWhatsAppInvoice(job)}>
                          <Send className="w-4 h-4" /> Invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-8">
                    No jobs match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
