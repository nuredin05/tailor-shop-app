import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  Scissors,
  Loader2,
  Maximize2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  User,
  Phone,
  Tag,
  Ruler,
  Layers,
  Info
} from 'lucide-react';

const CutterDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');

  // Interactive CAD Canvas View States
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [hoveredMeasurement, setHoveredMeasurement] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showSeams, setShowSeams] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Automated Pattern drafting formulas based on tailoring standards
  const getCADBlueprints = (itemType, measurements) => {
    const chest = parseFloat(measurements?.chest) || parseFloat(measurements?.chest_width) || 38;
    const length = parseFloat(measurements?.length) || parseFloat(measurements?.total_length) || 30;
    const shoulder = parseFloat(measurements?.shoulder) || parseFloat(measurements?.shoulder_width) || 18;
    const waist = parseFloat(measurements?.waist) || parseFloat(measurements?.waist_line) || 34;
    const armhole = parseFloat(measurements?.armhole) || parseFloat(measurements?.armhole_depth) || 9.5;
    const sleeves = parseFloat(measurements?.sleeves) || parseFloat(measurements?.sleeve_length) || 24;
    const neck = parseFloat(measurements?.neck) || parseFloat(measurements?.collar) || 15;
    const hip = parseFloat(measurements?.hip) || parseFloat(measurements?.hips) || 40;

    const scale = 7; // Screen scaling matrix factor (1 inch = 7 pixels)
    const normalizedType = (itemType || 'Shirt').toLowerCase();

    let path = '';
    let seamPath = '';
    let internalLines = [];
    let guideLabels = [];
    let annotations = [];
    let viewBoxWidth = 500;
    let viewBoxHeight = 500;

    // --- CAD MODULE 1: TROUSERS / PANTS ---
    if (normalizedType.includes('trouser') || normalizedType.includes('pant') || normalizedType.includes('bottom')) {
      const waistW = (waist / 4 + 1) * scale;
      const hipW = (hip / 4 + 1.5) * scale;
      const outseamH = length * scale;
      const crotchD = (hip / 4 + 2) * scale;
      const bottomW = 8 * scale;

      const xOff = 50;
      const yOff = 40;
      viewBoxWidth = hipW + 150;
      viewBoxHeight = outseamH + 100;

      path = `M ${xOff},${yOff}
              L ${xOff + waistW},${yOff}
              Q ${xOff + hipW + 10},${yOff + crotchD * 0.4} ${xOff + hipW},${yOff + crotchD}
              Q ${xOff + hipW + 25},${yOff + crotchD + 5} ${xOff + hipW * 0.85},${yOff + crotchD + 20}
              L ${xOff + bottomW + 20},${yOff + outseamH}
              L ${xOff + 20},${yOff + outseamH}
              L ${xOff},${yOff + crotchD}
              Z`;

      if (showSeams) {
        seamPath = `M ${xOff + 8},${yOff + 8}
                    L ${xOff + waistW - 8},${yOff + 8}
                    Q ${xOff + hipW + 2},${yOff + crotchD * 0.4} ${xOff + hipW - 8},${yOff + crotchD}
                    Q ${xOff + hipW + 15},${yOff + crotchD + 3} ${xOff + hipW * 0.85 - 6},${yOff + crotchD + 16}
                    L ${xOff + bottomW + 14},${yOff + outseamH - 8}
                    L ${xOff + 26},${yOff + outseamH - 8}
                    L ${xOff + 8},${yOff + crotchD}
                    Z`;
      }

      internalLines.push({
        d: `M ${xOff},${yOff + crotchD} L ${xOff + hipW},${yOff + crotchD}`,
        stroke: 'rgba(51, 65, 85, 0.4)',
        strokeWidth: 1
      });

      guideLabels = [
        { x: xOff + waistW / 2, y: yOff - 12, text: `Waist/4 + 1": ${(waist / 4 + 1).toFixed(1)}"`, key: 'waist' },
        { x: xOff + hipW + 15, y: yOff + crotchD - 5, text: `Crotch: ${(hip / 4 + 2).toFixed(1)}"`, key: 'hip' },
        { x: xOff - 20, y: yOff + outseamH / 2, text: `Outseam: ${length}"`, key: 'length' }
      ];

      annotations.push(
        { x1: xOff, y1: yOff, x2: xOff + waistW, y2: yOff, key: 'waist', label: 'Waistband Attachment Line' },
        { x1: xOff + hipW, y1: yOff + crotchD, x2: xOff + hipW * 0.85, y2: yOff + crotchD + 20, key: 'hip', label: 'Crotch Curve Rise Seam' },
        { x1: xOff, y1: yOff, x2: xOff, y2: yOff + outseamH, key: 'length', label: 'Side Outseam Construction Reference' }
      );

      // --- CAD MODULE 2: SUITS / BLAZERS / JACKETS ---
    } else if (normalizedType.includes('coat') || normalizedType.includes('jacket') || normalizedType.includes('suit')) {
      const shldW = (shoulder / 2) * scale;
      const chestW = (chest / 4 + 2.5) * scale;
      const lenH = length * scale;
      const armDepth = armhole ? armhole * scale : (chest / 4 + 0.5) * scale;

      const xOff = 50;
      const yOff = 50;
      viewBoxWidth = chestW + 150;
      viewBoxHeight = lenH + 100;

      path = `M ${xOff},${yOff + 25}
              L ${xOff + shldW},${yOff + 10}
              Q ${xOff + shldW - 10},${yOff + armDepth * 0.6} ${xOff + chestW},${yOff + armDepth}
              L ${xOff + chestW * 0.9},${yOff + lenH * 0.6}
              L ${xOff + chestW},${yOff + lenH}
              L ${xOff},${yOff + lenH}
              L ${xOff - 15},${yOff + lenH * 0.4}
              Z`;

      if (showSeams) {
        seamPath = `M ${xOff + 8},${yOff + 27}
                    L ${xOff + shldW - 6},${yOff + 14}
                    Q ${xOff + shldW - 18},${yOff + armDepth * 0.6} ${xOff + chestW - 8},${yOff + armDepth - 4}
                    L ${xOff + chestW * 0.9 - 8},${yOff + lenH * 0.6}
                    L ${xOff + chestW - 8},${yOff + lenH - 8}
                    L ${xOff + 8},${yOff + lenH - 8}
                    L ${xOff - 7},${yOff + lenH * 0.4}
                    Z`;
      }

      internalLines.push({
        d: `M ${xOff},${yOff + armDepth} L ${xOff + chestW},${yOff + armDepth}`,
        stroke: 'rgba(51, 65, 85, 0.4)',
        strokeWidth: 1
      });

      guideLabels = [
        { x: xOff + shldW / 2, y: yOff - 10, text: `Shoulder: ${(shoulder / 2).toFixed(1)}"`, key: 'shoulder' },
        { x: xOff + chestW + 10, y: yOff + armDepth - 6, text: `Chest Block: ${chest}"`, key: 'chest' },
        { x: xOff - 25, y: yOff + lenH / 2, text: `Jacket Length: ${length}"`, key: 'length' }
      ];

      annotations.push(
        { x1: xOff, y1: yOff + 25, x2: xOff + shldW, y2: yOff + 10, key: 'shoulder', label: 'Shoulder Seam Slope' },
        { x1: xOff + shldW, y1: yOff + 10, x2: xOff + chestW, y2: yOff + armDepth, key: 'armhole', label: 'Armhole Inset Arc' },
        { x1: xOff, y1: yOff + 25, x2: xOff, y2: yOff + lenH, key: 'length', label: 'Center Front Centerline Trace' }
      );

      // --- CAD MODULE 3: FEMININE BLOUSE / DRESS / GOWNS ---
    } else if (normalizedType.includes('dress') || normalizedType.includes('gown') || normalizedType.includes('frock')) {
      const shldW = (shoulder / 2) * scale;
      const chestW = (chest / 4 + 1.2) * scale;
      const waistW = (waist / 4 + 1) * scale;
      const lenH = length * scale;
      const armDepth = armhole ? armhole * scale : (chest / 4 - 0.5) * scale;
      const flareW = chestW * 1.8;

      const xOff = 50;
      const yOff = 40;
      viewBoxWidth = flareW + 150;
      viewBoxHeight = lenH + 100;

      path = `M ${xOff},${yOff + 15}
              L ${xOff + shldW},${yOff + 5}
              Q ${xOff + shldW - 15},${yOff + armDepth * 0.6} ${xOff + chestW},${yOff + armDepth}
              L ${xOff + waistW},${yOff + lenH * 0.35}
              Q ${xOff + waistW * 1.3},${yOff + lenH * 0.6} ${xOff + flareW},${yOff + lenH}
              L ${xOff},${yOff + lenH}
              Z`;

      if (showSeams) {
        seamPath = `M ${xOff + 8},${yOff + 17}
                    L ${xOff + shldW - 6},${yOff + 9}
                    Q ${xOff + shldW - 22},${yOff + armDepth * 0.6} ${xOff + chestW - 8},${yOff + armDepth - 4}
                    L ${xOff + waistW - 8},${yOff + lenH * 0.35}
                    Q ${xOff + waistW * 1.3 - 8},${yOff + lenH * 0.6} ${xOff + flareW - 8},${yOff + lenH - 8}
                    L ${xOff + 8},${yOff + lenH - 8}
                    Z`;
      }

      internalLines.push({
        d: `M ${xOff},${yOff + lenH * 0.35} L ${xOff + waistW},${yOff + lenH * 0.35}`,
        stroke: 'rgba(51, 65, 85, 0.4)',
        strokeWidth: 1,
        dashArray: '2 2'
      });

      guideLabels = [
        { x: xOff + chestW + 10, y: yOff + armDepth - 5, text: `Bust/4 + 1.2": ${(chest / 4 + 1.2).toFixed(1)}"`, key: 'chest' },
        { x: xOff + waistW + 10, y: yOff + lenH * 0.35 + 4, text: `Waist Base: ${waist}"`, key: 'waist' },
        { x: xOff - 20, y: yOff + lenH / 2, text: `Full Length: ${length}"`, key: 'length' }
      ];

      annotations.push(
        { x1: xOff + chestW, y1: yOff + armDepth, x2: xOff + waistW, y2: yOff + lenH * 0.35, key: 'waist', label: 'Bodice Inseam Taper' },
        { x1: xOff + waistW, y1: yOff + lenH * 0.35, x2: xOff + flareW, y2: yOff + lenH, key: 'length', label: 'Skirt Flare Line Expansion' }
      );

      // --- CAD MODULE 4: DYNAMIC SHIRT / TOPS & INDEPENDENT SLEEVE WORKSPACE ---
    } else {
      const neckW = (neck / 5) * scale;
      const shldW = (shoulder / 2) * scale;
      const chestW = (chest / 4 + 1.5) * scale;
      const waistW = (waist / 4 + 1.0) * scale;
      const lenH = length * scale;
      const armDepth = armhole ? armhole * scale : (chest / 4) * scale;
      const slvLen = sleeves ? sleeves * scale : 24 * scale;

      const xCF = 40;
      const yTop = 50;
      const xSleeveOffset = chestW + 100; // Side-by-side splitting point

      viewBoxWidth = xSleeveOffset + slvLen + 80;
      viewBoxHeight = lenH + 120;

      // 1. Structural Path for the Shirt Body Panel
      path = `M ${xCF},${yTop + neckW}
              Q ${xCF + neckW * 0.3},${yTop + neckW} ${xCF + neckW},${yTop}
              L ${xCF + shldW},${yTop + 25}
              Q ${xCF + shldW - 15},${yTop + armDepth * 0.7} ${xCF + chestW},${yTop + armDepth}
              L ${xCF + waistW},${yTop + lenH * 0.6}
              L ${xCF + chestW},${yTop + lenH}
              Q ${xCF + chestW * 0.5},${yTop + lenH + 12} ${xCF},${yTop + lenH + 4}
              Z`;

      // 2. Structural Path for the Independent Sleeve Component
      const slvWidth = (chest * 0.2) * scale;
      path += ` M ${xSleeveOffset},${yTop + 40}
                Q ${xSleeveOffset + slvLen * 0.25},${yTop - 5} ${xSleeveOffset + slvLen * 0.35},${yTop + slvWidth * 0.5}
                L ${xSleeveOffset + slvLen},${yTop + slvWidth * 0.4}
                L ${xSleeveOffset + slvLen},${yTop + slvWidth}
                L ${xSleeveOffset},${yTop + slvWidth}
                Z`;

      if (showSeams) {
        seamPath = `M ${xCF + 8},${yTop + neckW}
                    Q ${xCF + neckW * 0.3},${yTop + neckW + 8} ${xCF + neckW + 2},${yTop + 8}
                    L ${xCF + shldW - 6},${yTop + 27}
                    Q ${xCF + shldW - 22},${yTop + armDepth * 0.7} ${xCF + chestW - 8},${yTop + armDepth - 4}
                    L ${xCF + waistW - 8},${yTop + lenH * 0.6}
                    L ${xCF + chestW - 8},${yTop + lenH - 8}
                    Q ${xCF + chestW * 0.5},${yTop + lenH + 4} ${xCF + 8},${yTop + lenH - 4}
                    Z
                    M ${xSleeveOffset + 8},${yTop + 40}
                    Q ${xSleeveOffset + slvLen * 0.25},${yTop + 3} ${xSleeveOffset + slvLen * 0.35},${yTop + slvWidth * 0.5 - 4}
                    L ${xSleeveOffset + slvLen - 8},${yTop + slvWidth * 0.4 + 4}
                    L ${xSleeveOffset + slvLen - 8},${yTop + slvWidth - 8}
                    L ${xSleeveOffset + 8},${yTop + slvWidth - 8}
                    Z`;
      }

      internalLines.push({
        d: `M ${xCF + 15},${yTop + neckW} L ${xCF + 15},${yTop + lenH + 4}`,
        stroke: '#475569',
        strokeWidth: 1.2,
        dashArray: '4 4'
      });

      internalLines.push({
        d: `M ${xCF},${yTop + armDepth} L ${xCF + chestW},${yTop + armDepth}`,
        stroke: 'rgba(51, 65, 85, 0.4)',
        strokeWidth: 1
      });

      guideLabels = [
        { x: xCF + 5, y: yTop - 12, text: `Collar: ${neck}"`, key: 'neck' },
        { x: xCF + shldW - 25, y: yTop + 10, text: `Shoulder: ${(shoulder / 2).toFixed(1)}"`, key: 'shoulder' },
        { x: xCF + chestW + 10, y: yTop + armDepth - 6, text: `Chest/4 + 1.5": ${(chest / 4 + 1.5).toFixed(1)}"`, key: 'chest' },
        { x: xCF - 15, y: yTop + lenH / 2, text: `Length: ${length}"`, key: 'length' },
        { x: xSleeveOffset + slvLen / 2, y: yTop + slvWidth + 18, text: `Sleeve Block: ${sleeves}"`, key: 'sleeves' }
      ];

      annotations.push(
        { x1: xCF + neckW, y1: yTop, x2: xCF + shldW, y2: yTop + 25, key: 'shoulder', label: 'Shoulder Slope Seam' },
        { x1: xCF, y1: yTop + armDepth, x2: xCF + chestW, y2: yTop + armDepth, key: 'chest', label: 'Chest Guideline' },
        { x1: xCF, y1: yTop + lenH * 0.6, x2: xCF + waistW, y2: yTop + lenH * 0.6, key: 'waist', label: 'Waist Alignment Line' },
        { x1: xCF, y1: yTop, x2: xCF, y2: yTop + lenH, key: 'length', label: 'Total Placket Length' },
        { x1: xSleeveOffset, y1: yTop + slvWidth, x2: xSleeveOffset + slvLen, y2: yTop + slvWidth, key: 'sleeves', label: 'Sleeve Length Underarm' }
      );
    }

    return { path, seamPath, internalLines, guideLabels, annotations, viewBoxWidth, viewBoxHeight };
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders?status=pending,cutting');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching cutter orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (order) => {
    setStatusToUpdate(order);
    setOrderStatus(order.status);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusToUpdate) return;

    try {
      await api.put(`/orders/${statusToUpdate._id}/status`, {
        status: orderStatus
      });
      setStatusToUpdate(null);
      fetchPendingOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-primaryClr animate-spin" />
        <p className="text-sm font-bold text-primaryClr/60 tracking-wider font-mono">LOADING PRODUCTION QUEUE...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Header Grid */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2 text-primaryClr/60 text-sm font-semibold mb-2">
            <div className="p-2 bg-primaryClr/5 rounded-lg text-primaryClr">
              <Scissors className="w-4 h-4" />
            </div>
            <span>Master Cutting Deck</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primaryClr">
            Welcome back, {user?.name || 'Cutter Master'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white border border-secondaryClr/10 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-secondaryClr/50 block">In Queue</span>
              <p className="text-xl font-bold text-primaryClr">{orders.filter(o => o.status === 'pending').length}</p>
            </div>
            <div className="w-px h-8 bg-secondaryClr/10" />
            <div>
              <span className="text-xs font-semibold text-secondaryClr/50 block">On Table</span>
              <p className="text-xl font-bold text-amber-500">{orders.filter(o => o.status === 'cutting').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RE-RESTORED ORIGINAL HIGH-QUALITY TABLE --- */}
      {orders.length === 0 ? (
        <div className="bg-white border border-secondaryClr/10 rounded-[2rem] p-16 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto text-green-500 mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-primaryClr">Cutting table completely clear!</h3>
          <p className="text-sm text-secondaryClr/60 max-w-md mx-auto leading-relaxed">
            There are currently no standard or custom orders left in the pending pattern pool. Enjoy the breather or coordinate with the Client Intake Officer.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-secondaryClr/10 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-secondaryClr/5 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-primaryClr">Active Cutting Pipeline</h2>
            <span className="text-xs font-semibold text-primaryClr bg-primaryClr/5 px-3 py-1.5 rounded-full">
              {orders.length} Active Job{orders.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondaryClr/5 text-secondaryClr uppercase tracking-widest text-[10px] font-bold">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Garments</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondaryClr/5">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-secondaryClr/[0.01] transition-colors group">
                    <td className="px-6 py-4 font-bold text-primaryClr">
                      {order.orderNumber || order._id?.slice(-5).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm text-secondaryClr text-left">
                        {order.customer?.name || 'Walk-in Client'}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {order.items?.map((item, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-secondaryClr/5 text-secondaryClr text-xs font-bold px-2.5 py-1 rounded-lg mr-2">
                          {item.itemType} <span className="opacity-60">x{item.quantity}</span>
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-secondaryClr/70">
                      {new Date(order.deadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${order.status === 'cutting'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {order.status === 'cutting' ? 'Cutting Table' : 'In Queue'}
                      </span>
                    </td>
                    <td className="px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer({
                              ...order.customer,
                              items: order.items,
                              styleNotes: order.styleNotes
                            });
                            setActiveItemIndex(0);
                          }}
                          className="px-2.5 py-1.5 border border-secondaryClr/10 hover:bg-secondaryClr/5 text-secondaryClr rounded-lg transition-all"
                          title="View CAD Layout"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenStatusModal(order)}
                          className={`px-2.5 py-1.5 rounded-lg transition-all ${order.status === 'cutting'
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-primaryClr hover:bg-primaryClr/90 text-white'
                            }`}
                          title={order.status === 'cutting' ? 'Finish Cutting' : 'Start Cutting'}
                        >
                          {order.status === 'cutting' ? <CheckCircle2 className="w-4 h-4" /> : <Scissors className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modern Dynamic CAD Interactive Modal Board */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => {
            setSelectedCustomer(null);
            setHoveredMeasurement(null);
          }}
          title={`Digital CAD Matrix Sheet: ${selectedCustomer.name || 'Client Specs'}`}
          className="max-w-5xl"
        >
          <div className="space-y-4 py-2">

            {/* Order & Client Summary Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-primaryClr/3 border border-primaryClr/10 rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-primaryClr/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-secondaryClr/40">Client</p>
                  <p className="text-sm font-bold text-primaryClr">{selectedCustomer.name || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primaryClr/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-secondaryClr/40">Phone</p>
                  <p className="text-sm font-bold text-secondaryClr">{selectedCustomer.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Layers className="w-4 h-4 text-primaryClr/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-secondaryClr/40">Total Items</p>
                  <p className="text-sm font-bold text-secondaryClr">{selectedCustomer.items?.length || 1} Garment{selectedCustomer.items?.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-primaryClr/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-secondaryClr/40">Active Pattern</p>
                  <p className="text-sm font-bold text-amber-600">{selectedCustomer.items?.[activeItemIndex]?.itemType || '—'}</p>
                </div>
              </div>
            </div>

            {/* Per-item notes from officer */}
            {selectedCustomer.items?.[activeItemIndex]?.notes && (
              <div className="flex items-start gap-2.5 bg-blue-50/60 border border-blue-200/50 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  <span className="font-bold">Item Notes: </span>{selectedCustomer.items?.[activeItemIndex]?.notes}
                </p>
              </div>
            )}

            {/* Multi-item Toggle Ribbon within a single order booking */}
            {selectedCustomer.items?.length > 1 && (
              <div className="flex gap-2 bg-gray-50/80 p-1.5 rounded-xl w-fit border border-gray-200/50">
                {selectedCustomer.items.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveItemIndex(idx);
                      setHoveredMeasurement(null);
                    }}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${activeItemIndex === idx
                      ? 'bg-white text-primaryClr shadow-sm border border-gray-200/50'
                      : 'text-secondaryClr/60 hover:text-primaryClr hover:bg-white/50'
                      }`}
                  >
                    {item.itemType}
                  </button>
                ))}
              </div>
            )}

            {/* Micro-System Status Control Bar */}
            <div className="flex flex-wrap items-center justify-between border border-slate-800 bg-slate-950 px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-slate-300 font-bold">PATTERN: {selectedCustomer.items?.[activeItemIndex]?.itemType?.toUpperCase()}</span>
                </div>
                <div className="hidden sm:block text-slate-600">|</div>
                <span className="hidden sm:block text-slate-500">QTY: {selectedCustomer.items?.[activeItemIndex]?.quantity || 1} PC</span>
                <div className="hidden sm:block text-slate-600">|</div>
                <span className="hidden sm:block text-slate-500">SCALE: 7px/in</span>
                <div className="hidden sm:block text-slate-600">|</div>
                <span className="hidden md:block text-emerald-400 font-bold">● MATRIX ACTIVE</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                  <input type="checkbox" checked={showGrid} onChange={() => setShowGrid(!showGrid)} className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-0 w-3.5 h-3.5" />
                  <span>Grid</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                  <input type="checkbox" checked={showSeams} onChange={() => setShowSeams(!showSeams)} className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-0 w-3.5 h-3.5" />
                  <span>Seams</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                  <input type="checkbox" checked={showAnnotations} onChange={() => setShowAnnotations(!showAnnotations)} className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-0 w-3.5 h-3.5" />
                  <span>Annotations</span>
                </label>
              </div>
            </div>

            {/* Double Column Display: Data Sidebar + Master Canvas Display */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

              {/* Floating Parameters Interactive List */}
              <div className="lg:col-span-1 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-secondaryClr/40 block mb-1">
                  Blueprint Parameters
                </span>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  {Object.entries(selectedCustomer.measurements || {}).map(([key, val]) => {
                    const cleanValue = parseFloat(val);
                    if (!cleanValue) return null;

                    const isHovered = hoveredMeasurement === key;

                    return (
                      <div
                        key={key}
                        onMouseEnter={() => setHoveredMeasurement(key)}
                        onMouseLeave={() => setHoveredMeasurement(null)}
                        className={`p-4 rounded-2xl border transition-all duration-300 cursor-crosshair text-center lg:text-left ${isHovered
                          ? 'bg-primaryClr text-white border-primaryClr shadow-md scale-105'
                          : 'bg-white border-gray-100 hover:border-primaryClr/30 hover:shadow-sm'
                          }`}
                      >
                        <span className={`text-[10px] uppercase font-bold tracking-widest block mb-1 ${isHovered ? 'text-white/80' : 'text-secondaryClr/50'}`}>
                          {key.replace('_', ' ')}
                        </span>
                        <p className={`text-xl font-bold ${isHovered ? 'text-white' : 'text-primaryClr'}`}>
                          {cleanValue}"
                        </p>
                      </div>
                    );
                  })}
                </div>

                {selectedCustomer.styleNotes && (
                  <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 mt-4">
                    <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-widest mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Style Directive</span>
                    </div>
                    <p className="text-sm text-amber-900/80 font-medium leading-relaxed">
                      {selectedCustomer.styleNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Obsidian Blueprint Engine Canvas Grid */}
              <div className="lg:col-span-3 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative flex flex-col justify-between min-h-[460px] overflow-hidden">
                {showGrid && (
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, #3b82f6 1px, transparent 1px),
                        linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }}
                  />
                )}

                <div className="my-auto overflow-auto flex items-center justify-center p-2 min-h-[360px]">
                  {(() => {
                    const blueprintData = getCADBlueprints(
                      selectedCustomer.items?.[activeItemIndex]?.itemType,
                      selectedCustomer.measurements
                    );

                    return (
                      <svg
                        width={blueprintData.viewBoxWidth}
                        height={blueprintData.viewBoxHeight}
                        className="overflow-visible font-mono select-none"
                      >
                        {showSeams && blueprintData.seamPath && (
                          <path
                            d={blueprintData.seamPath}
                            fill="none"
                            stroke="#64748b"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            className="opacity-70"
                          />
                        )}

                        <path
                          d={blueprintData.path}
                          fill="rgba(59, 130, 246, 0.05)"
                          stroke="#3b82f6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {blueprintData.internalLines?.map((line, lIdx) => (
                          <line
                            key={lIdx}
                            {...(line.d ? { d: line.d } : {
                              x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2
                            })}
                            stroke={line.stroke}
                            strokeWidth={line.strokeWidth}
                            strokeDasharray={line.dashArray}
                          />
                        ))}

                        {blueprintData.guideLabels?.map((label, lblIdx) => {
                          const isHighlighted = hoveredMeasurement === label.key;
                          return (
                            <g key={lblIdx} className="transition-all duration-200">
                              {isHighlighted && (
                                <circle cx={label.x} cy={label.y - 4} r="3" fill="#ef4444" className="animate-ping" />
                              )}
                              <text
                                x={label.x}
                                y={label.y}
                                className={`text-[10px] font-bold ${isHighlighted ? 'fill-rose-400 font-black text-xs scale-105' : 'fill-slate-400'}`}
                              >
                                {label.text}
                              </text>
                            </g>
                          );
                        })}

                        {showAnnotations && blueprintData.annotations?.map((anno, aIdx) => {
                          const isActive = hoveredMeasurement === anno.key;
                          if (!isActive) return null;

                          return (
                            <g key={aIdx} className="opacity-90 animate-fadeIn">
                              <line x1={anno.x1} y1={anno.y1} x2={anno.x2} y2={anno.y2} stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
                              <rect x={(anno.x1 + anno.x2) / 2 - 50} y={(anno.y1 + anno.y2) / 2 - 25} width="100" height="18" rx="4" fill="#1e1b4b" stroke="#f43f5e" strokeWidth="1" />
                              <text x={(anno.x1 + anno.x2) / 2} y={(anno.y1 + anno.y2) / 2 - 13} textAnchor="middle" className="fill-rose-300 text-[8px] font-bold tracking-tight">
                                {anno.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>

                <div className="text-[9px] font-mono text-slate-500 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-2">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600">SCALE: 1in = 7px</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-600">UNIT: inches</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">PATTERN: {selectedCustomer.items?.[activeItemIndex]?.itemType?.toUpperCase()}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-emerald-500">● SEAM ALLOWANCE: {showSeams ? 'ON' : 'OFF'}</span>
                  </div>
                  <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition">
                    <span>⎙</span> Print Blueprint
                  </button>
                </div>
              </div>

            </div>

            {/* Measurement Summary Table */}
            <div className="border border-secondaryClr/10 rounded-2xl overflow-hidden">
              <div className="bg-secondaryClr/5 px-4 py-2.5 flex items-center gap-2">
                <Ruler className="w-3.5 h-3.5 text-primaryClr/60" />
                <span className="text-[10px] font-black uppercase tracking-widest text-secondaryClr/50">Full Measurement Spec Sheet</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 divide-x divide-secondaryClr/5">
                {Object.entries(selectedCustomer.measurements || {}).map(([key, val]) => {
                  const v = parseFloat(val);
                  if (!v) return null;
                  return (
                    <div key={key} className="px-3 py-2.5 text-center">
                      <p className="text-[9px] uppercase font-bold tracking-widest text-secondaryClr/40 mb-0.5">{key.replace('_', ' ')}</p>
                      <p className="text-sm font-black text-primaryClr">{v}"</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center gap-2 border-t border-secondaryClr/5">
              <p className="text-xs text-secondaryClr/40 font-mono">
                Generated: {new Date().toLocaleString()} · Client: {selectedCustomer.name}
              </p>
              <Button variant="outline" onClick={() => { setSelectedCustomer(null); setHoveredMeasurement(null); }}>
                Close Blueprint Panel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Original Production Stage Form Modal Drawer */}
      <Modal
        isOpen={!!statusToUpdate}
        onClose={() => setStatusToUpdate(null)}
        title={`Update Cutting Stage: ${statusToUpdate?.orderNumber}`}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">Set New Stage</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
            >
              <option value="pending">Pending</option>
              <option value="cutting">Cutting In Progress</option>
              <option value="sewing">Pass to Tailors (Sewing)</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStatusToUpdate(null)} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" className="w-1/2">
              Update Stage
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CutterDashboard;