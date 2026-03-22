import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Check, Send, Printer, Trash2 } from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJob, updateJobStatus, processPayment, deleteJob } = useStore();

  const job = getJob(id);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState('Cash');

  if (!job) {
    return <div className="text-center mt-20 text-xl font-bold bg-white p-8 rounded shadow">Job not found. <button className="btn btn-primary ml-4" onClick={() => navigate('/jobs')}>Go back</button></div>;
  }

  const statuses = ['Received', 'In Repair', 'Completed', 'Delivered'];
  const currentStatusIdx = statuses.indexOf(job.status);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this job sheet? This action cannot be undone.')) {
      deleteJob(id);
      navigate('/jobs');
    }
  };

  const advanceStatus = () => {
    if (currentStatusIdx < statuses.length - 1) {
      const nextStatus = statuses[currentStatusIdx + 1];
      if (job.status === 'Completed' && nextStatus === 'Delivered') {
        if (!job.payment) {
          setShowPaymentModal(true);
          return;
        }
      }
      updateJobStatus(id, nextStatus);
    }
  };

  const handlePayment = () => {
    processPayment(id, {
      amount: job.quotedPrice,
      mode: paymentMode
    });
    setShowPaymentModal(false);
    updateJobStatus(id, 'Delivered');
  };

  const handleWhatsAppUpdate = (statusType) => {
    let messageText = '';
    const baseDetails = `\nJob Sheet: ${job.id}\nDevice: ${job.brand} ${job.model}\nIMEI/Serial: ${job.imei || 'N/A'}`;

    if (statusType === 'Received') {
      messageText = `Hello ${job.customerName},\n\nYour device repair request is received and we will take this to repair desk shortly.${baseDetails}`;
    } else if (statusType === 'In Repair') {
      messageText = `Hello ${job.customerName},\n\nYour device is at the repair desk now. We will keep you updated with the progress.${baseDetails}`;
    } else if (statusType === 'Completed') {
      messageText = `Hello ${job.customerName},\n\nWe did it. Your device is repaired successfully and we completed the diagnose too. You are welcome to collect your device.${baseDetails}\nTotal Amount: ₹${job.quotedPrice}`;
    }

    if (messageText) {
      messageText += '\n\nThink Privacy First | Phonefix';
      window.open(`https://wa.me/${job.whatsapp}?text=${encodeURIComponent(messageText)}`, '_blank');
    }
  };

  const handleWhatsAppInvoice = () => {
    if (!job.payment) return;
    const text = `Hello ${job.customerName},\n\nThank you for choosing us! Your device (${job.brand} ${job.model}, IMEI: ${job.imei || 'N/A'}) has been delivered.\n\nInvoice Details:\nJob Sheet: ${job.id}\nAmount Paid: ₹${job.payment.amount}\nPayment Mode: ${job.payment.mode}\n\nThank you!\n\nThink Privacy First | Phonefix`;
    window.open(`https://wa.me/${job.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="hide-on-print">
        <div className="flex justify-between items-center mb-6">
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" /> Delete Job
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold">{job.id}</h1>
                  <div className="text-muted">Created on {new Date(job.createdAt).toLocaleString()}</div>
                </div>
                <span className={`badge ${job.status === 'Delivered' ? 'badge-default' : 'badge-primary'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  {job.status}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-4 border-b pb-2">Customer & Device Details</h3>
              <div className="grid grid-cols-2 gap-y-4 mb-6">
                <div><strong className="text-muted block text-sm uppercase">Customer Name</strong>{job.customerName}</div>
                <div><strong className="text-muted block text-sm uppercase">WhatsApp</strong>{job.whatsapp}</div>
                {job.alternateNumber && <div><strong className="text-muted block text-sm uppercase">Alt Number</strong>{job.alternateNumber}</div>}
                <div><strong className="text-muted block text-sm uppercase">Brand & Model</strong>{job.brand} {job.model}</div>
                <div><strong className="text-muted block text-sm uppercase">IMEI / Serial No</strong>{job.imei || 'N/A'}</div>
                <div><strong className="text-muted block text-sm uppercase">Quoted Price</strong>₹{job.quotedPrice}</div>
                <div className="col-span-2"><strong className="text-muted block text-sm uppercase">Problem Description</strong>{job.problem}</div>
              </div>

              {job.payment && (
                <>
                  <h3 className="text-xl font-bold mb-4 border-b pb-2 mt-8">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-y-4 p-4 bg-green-50 rounded border border-green-100">
                    <div><strong className="text-green-800 block text-sm uppercase">Amount Paid</strong><span className="text-lg font-bold text-green-700">₹{job.payment.amount}</span></div>
                    <div><strong className="text-green-800 block text-sm uppercase">Payment Mode</strong>{job.payment.mode}</div>
                    <div className="col-span-2"><strong className="text-green-800 block text-sm uppercase">Date</strong>{new Date(job.payment.date).toLocaleString()}</div>
                  </div>
                </>
              )}

            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="font-bold mb-4">Status Timeline</h3>
              <div className="space-y-4 border-l-2 border-slate-200 ml-3 pl-4">
                {statuses.map((s, i) => {
                  const timelineEvent = job.timeline.find(t => t.status === s);
                  const isCompleted = !!timelineEvent;
                  const isCurrent = job.status === s;
                  return (
                    <div key={s} className="relative pb-4 last:pb-0">
                      <div className={`absolute -left-[1.6rem] top-1 w-4 h-4 rounded-full border-2 bg-white ${isCompleted ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`font-bold ${isCurrent ? 'text-primary' : (isCompleted ? 'text-slate-800' : 'text-slate-400')}`}>{s}</div>
                          <div className="text-xs text-muted">{timelineEvent ? new Date(timelineEvent.date).toLocaleDateString() : 'Pending'}</div>
                        </div>
                        {isCompleted && s !== 'Delivered' && (
                          <button className="btn btn-outline py-1 px-2 text-xs" onClick={() => handleWhatsAppUpdate(s)} title="Share Status Update to WhatsApp">
                            <Send className="w-3 h-3 text-green-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t">
                {currentStatusIdx < statuses.length - 1 && (
                  <button className="btn btn-primary w-full" onClick={advanceStatus}>
                    Mark as {statuses[currentStatusIdx + 1]}
                  </button>
                )}
              </div>
            </div>

            {job.status === 'Delivered' && (
              <div className="card">
                <h3 className="font-bold mb-4">Digital Invoice</h3>
                <div className="space-y-3">
                  <button className="btn btn-outline w-full justify-start" onClick={handleWhatsAppInvoice}>
                    <Send className="w-4 h-4 text-green-600" /> Share via WhatsApp
                  </button>
                  <button className="btn btn-outline w-full justify-start" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 text-slate-600" /> Print Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="modal-overlay hide-on-print">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-xl font-bold">Collect Payment</h2>
            </div>
            <div className="form-group mb-6">
              <div className="p-4 bg-blue-50 text-blue-800 rounded mb-4 font-bold text-xl text-center shadow-sm">
                Total Amount: ₹{job.quotedPrice}
              </div>
              <label className="form-label mb-2">Select Payment Mode</label>
              <div className="grid grid-cols-1 gap-3">
                {['Cash', 'Card', 'UPI', 'Credit'].map(mode => (
                  <label
                    key={mode}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMode === mode ? 'border-primary bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode}
                      checked={paymentMode === mode}
                      onChange={() => setPaymentMode(mode)}
                      className="cursor-pointer"
                      style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }}
                    />
                    <span className={`font-bold ${paymentMode === mode ? 'text-primary' : 'text-slate-700'}`}>{mode}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-8 border-t pt-4">
              <button className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn btn-primary px-6" onClick={handlePayment}>Mark as Paid & Deliver</button>
            </div>
          </div>
        </div>
      )}

      {job.status === 'Delivered' && (
        <div className="print-invoice mt-8 pt-8 text-black text-left relative" style={{ maxWidth: '800px', margin: '0 auto', zIndex: 1 }}>
          <img
            src="/logo.png"
            alt="Watermark"
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '350px', height: 'auto', opacity: 0.25, zIndex: -1, pointerEvents: 'none' }}
          />
          <div className="mb-12 pb-8 border-b-2 border-slate-200">
            <h1 className="text-5xl font-black mb-3 tracking-tight">Phonefix</h1>
            <p className="text-slate-500 font-medium">Smartphone Device Repair Service Center</p>
            <p className="text-slate-500 text-sm mt-1">support@phonefix.co.in | Call Us : 9879-210-220</p>
          </div>

          <div className="mb-12">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-light mb-8 text-slate-800">Repair Invoice</h2>
                <div className="mb-8">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Job Sheet Number</p>
                  <p className="font-bold text-xl text-slate-700">{job.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Date</p>
                <p className="text-xl font-medium">{new Date(job.payment.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl mb-10 border border-slate-100">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">Customer Details</h3>
            <p className="text-xl font-bold mb-1">{job.customerName}</p>
            <p className="text-slate-500">{job.whatsapp}</p>
          </div>

          <table className="w-full mb-10 text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-4 pr-2 text-left text-xs font-bold uppercase text-slate-400 tracking-wider">Service Description</th>
                <th className="py-4 pl-2 text-xs font-bold uppercase text-slate-400 tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-6 pr-2 text-left">
                  <p className="font-bold text-xl mb-2">{job.brand} {job.model} Repair</p>
                  <p className="text-slate-500 mb-1">IMEI / Serial No: {job.imei || 'N/A'}</p>
                  <p className="text-slate-500">{job.problem}</p>
                </td>
                <td className="py-6 pl-2 text-right font-medium text-xl">₹{job.quotedPrice}</td>
              </tr>
            </tbody>
          </table>

          {job.payment && (
            <div className="w-1/2 ml-auto border-t-2 border-slate-800 pt-6 mt-10">
              <div className="flex justify-between items-center mb-3">
                <p className="text-slate-500 font-medium">Payment Mode</p>
                <p className="font-bold text-lg">{job.payment.mode}</p>
              </div>
              <div className="flex justify-between items-center text-3xl font-black mt-6 pt-6 border-t border-slate-200 text-slate-900">
                <p>Total Paid</p>
                <p>₹{job.payment.amount}</p>
              </div>
            </div>
          )}

          <div className="mt-12">
            <p className="font-bold text-slate-800 my-10 py-6 border-y-2 border-slate-200 text-center text-xl">Thank you for trusting Phonefix.</p>

            <div className="text-sm text-slate-500 space-y-2 mb-12">
              <p className="font-bold uppercase tracking-wider text-xs mb-3 text-slate-400">Terms & Conditions</p>
              <p>1. Parts once installed can not be taken back.</p>
              <p>2. All the repairs are covered under 30 Days warranty</p>
              <p>3. Any kind of damage of data is customer liability only</p>
              <p>4. Batteries are covered under 180 Days warranty. (Subject to approval)</p>
            </div>

            <div style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ display: 'inline-block', fontWeight: 'bold', fontSize: '1.25rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Think Privacy First
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
