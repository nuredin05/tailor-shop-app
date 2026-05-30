import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { generateCADBlueprint } from '../../services/PatternEngine';
import { getInstructionTemplate } from '../../services/InstructionTemplate';
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
  Info,
  Calendar
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

  // CAD Blueprint Data - Generated from PatternEngine Service
  const [cadBlueprintData, setCadBlueprintData] = useState(null);

  // Automated Pattern drafting formulas based on tailoring standards
  // Now delegated to PatternEngine service and managed with useEffect
  useEffect(() => {
    if (selectedCustomer && selectedCustomer.items?.[activeItemIndex]) {
      const currentItem = selectedCustomer.items[activeItemIndex];
      const blueprintData = generateCADBlueprint(
        currentItem.itemType,
        selectedCustomer.measurements,
        showSeams
      );
      setCadBlueprintData(blueprintData);
    }
  }, [selectedCustomer, activeItemIndex, showSeams]);

  // Memoize instruction template to avoid recalculation on every render
  const currentInstructions = useMemo(() => {
    if (selectedCustomer?.items?.[activeItemIndex]) {
      return getInstructionTemplate(selectedCustomer.items[activeItemIndex].itemType);
    }
    return null;
  }, [selectedCustomer, activeItemIndex]);

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-secondaryClr/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primaryClr/10 to-blue-500/10 rounded-full mb-3 border border-primaryClr/10">
            <div className="p-1.5 bg-white rounded-full text-primaryClr shadow-sm">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-primaryClr/80">Master Cutting Deck</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-secondaryClr bg-clip-text text-transparent bg-gradient-to-br from-secondaryClr to-primaryClr">
            Welcome back, {user?.name || 'Cutter Master'}
          </h1>
          <p className="mt-2 text-sm text-secondaryClr/50 font-medium">Coordinate, measure, and precisely draft garments from the production queue.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white border border-secondaryClr/5 px-6 py-4 rounded-3xl shadow-xl shadow-primaryClr/5 flex items-center gap-6 hover:shadow-2xl transition-all duration-300">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondaryClr/40 block mb-1">In Queue</span>
              <p className="text-3xl font-black text-primaryClr">{orders.filter(o => o.status === 'pending').length}</p>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-secondaryClr/10 to-transparent" />
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondaryClr/40 block mb-1">On Table</span>
              <p className="text-3xl font-black text-amber-500 drop-shadow-sm">{orders.filter(o => o.status === 'cutting').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RE-RESTORED ORIGINAL HIGH-QUALITY TABLE --- */}
      {orders.length === 0 ? (
        <div className="bg-white border border-secondaryClr/5 rounded-[2rem] p-16 text-center max-w-2xl mx-auto space-y-4 shadow-xl shadow-primaryClr/5 transform transition-all hover:scale-[1.01]">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center mx-auto text-emerald-500 mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10 drop-shadow-sm" />
          </div>
          <h3 className="text-2xl font-black text-secondaryClr">Cutting table completely clear!</h3>
          <p className="text-sm text-secondaryClr/50 max-w-md mx-auto leading-relaxed font-medium">
            There are currently no standard or custom orders left in the pending pattern pool. Enjoy the breather or coordinate with the Client Intake Officer.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-secondaryClr/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primaryClr/5">
          <div className="px-8 py-6 border-b border-secondaryClr/5 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-xl font-black text-secondaryClr flex items-center gap-2">
              Active Cutting Pipeline
            </h2>
            <span className="text-xs font-bold text-primaryClr bg-primaryClr/10 px-4 py-2 rounded-full shadow-inner">
              {orders.length} Active Job{orders.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-secondaryClr/40 uppercase tracking-widest text-[10px] font-black">
                  <th className="px-6 py-3 pl-8">Order ID</th>
                  <th className="px-6 py-3">Customer Name</th>
                  <th className="px-6 py-3">Garments</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="">
                {orders.map((order) => (
                  <tr key={order._id} className="group bg-white hover:bg-slate-50/50 transition-all duration-300 shadow-sm border border-secondaryClr/5 hover:shadow-md rounded-2xl overflow-hidden">
                    <td className="px-6 py-5 pl-8 font-black text-primaryClr/80 rounded-l-2xl border-y border-l border-secondaryClr/5 group-hover:border-primaryClr/20 transition-colors">
                      {order.orderNumber || order._id?.slice(-5).toUpperCase()}
                    </td>
                    <td className="px-6 py-5 border-y border-secondaryClr/5 group-hover:border-primaryClr/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primaryClr/20 to-primaryClr/5 flex items-center justify-center text-primaryClr font-bold text-xs shadow-inner">
                          {(order.customer?.name || 'W').charAt(0)}
                        </div>
                        <span className="font-bold text-sm text-secondaryClr">
                          {order.customer?.name || 'Walk-in Client'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 border-y border-secondaryClr/5 group-hover:border-primaryClr/20 transition-colors">
                      <div className="flex flex-wrap gap-2">
                        {order.items?.map((item, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 bg-slate-100/80 text-secondaryClr/80 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border border-secondaryClr/5 shadow-sm">
                            {item.itemType} <span className="opacity-50 text-[10px]">x{item.quantity}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 border-y border-secondaryClr/5 group-hover:border-primaryClr/20 transition-colors">
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-secondaryClr/60 bg-secondaryClr/5 px-3 py-1.5 rounded-xl">
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        {new Date(order.deadline).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5 border-y border-secondaryClr/5 group-hover:border-primaryClr/20 transition-colors">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm ${order.status === 'cutting'
                        ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                        {order.status === 'cutting' ? 'Cutting Table' : 'In Queue'}
                      </span>
                    </td>
                    <td className="px-6 py-5 pr-8 text-right rounded-r-2xl border-y border-r border-secondaryClr/5 group-hover:border-primaryClr/20 transition-colors">
                      <div className="flex items-center justify-end gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer({
                              ...order.customer,
                              items: order.items,
                              styleNotes: order.notes,
                              orderSampleImage: order.sampleImage
                            });
                            setActiveItemIndex(0);
                          }}
                          className="px-3 py-2 border border-secondaryClr/10 hover:bg-primaryClr hover:text-white hover:border-primaryClr text-secondaryClr/70 rounded-xl transition-all shadow-sm"
                          title="View CAD Layout"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenStatusModal(order)}
                          className={`px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${order.status === 'cutting'
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white border-emerald-400'
                            : 'bg-gradient-to-r from-primaryClr to-blue-600 text-white border-primaryClr'
                            }`}
                          title={order.status === 'cutting' ? 'Finish Cutting' : 'Start Cutting'}
                        >
                          {order.status === 'cutting' ? (
                            <div className="flex items-center gap-2 font-bold text-xs"><CheckCircle2 className="w-4 h-4" /> Finish</div>
                          ) : (
                            <div className="flex items-center gap-2 font-bold text-xs"><Scissors className="w-4 h-4" /> Start</div>
                          )}
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
          title={`Blueprint & Measurements: ${selectedCustomer.name || 'Client Specs'}`}
          size="full"
        >
          <div className="space-y-4 py-2">


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
              <div className="flex gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-fit border border-secondaryClr/5 shadow-inner">
                {selectedCustomer.items.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveItemIndex(idx);
                      setHoveredMeasurement(null);
                    }}
                    className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${activeItemIndex === idx
                      ? 'bg-white text-primaryClr shadow-md border border-white transform scale-[1.02]'
                      : 'text-secondaryClr/50 hover:text-primaryClr hover:bg-white/50 border border-transparent'
                      }`}
                  >
                    {item.itemType}
                  </button>
                ))}
              </div>
            )}

            {/* Micro-System Status Control Bar - Simplified */}
            <div className="flex flex-wrap items-center justify-between bg-primaryClr/5 px-4 py-3 rounded-xl border border-primaryClr/10 text-xs font-bold text-primaryClr/70 gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-primaryClr">
                  <Scissors className="w-4 h-4" />
                  <span>Pattern: {selectedCustomer.items?.[activeItemIndex]?.itemType?.toUpperCase()}</span>
                </div>
                <div className="hidden sm:block text-primaryClr/20">|</div>
                <span className="hidden sm:block">Qty: {selectedCustomer.items?.[activeItemIndex]?.quantity || 1}</span>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer hover:text-primaryClr transition-colors">
                  <input type="checkbox" checked={showGrid} onChange={() => setShowGrid(!showGrid)} className="rounded border-primaryClr/20 text-primaryClr focus:ring-primaryClr/20 w-4 h-4" />
                  <span>Grid</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-primaryClr transition-colors">
                  <input type="checkbox" checked={showSeams} onChange={() => setShowSeams(!showSeams)} className="rounded border-primaryClr/20 text-primaryClr focus:ring-primaryClr/20 w-4 h-4" />
                  <span>Seams</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-primaryClr transition-colors">
                  <input type="checkbox" checked={showAnnotations} onChange={() => setShowAnnotations(!showAnnotations)} className="rounded border-primaryClr/20 text-primaryClr focus:ring-primaryClr/20 w-4 h-4" />
                  <span>Annotations</span>
                </label>
              </div>
            </div>

            {/* Full Width Display: Horizontal Measurements Ribbon + Master Canvas Display */}
            <div className="flex flex-col gap-4">

              {/* Required Measurements Ribbon */}
              <div className="bg-primaryClr/5 p-3 rounded-2xl border border-primaryClr/10 w-full mb-2">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Ruler className="w-3.5 h-3.5 text-primaryClr" />
                  <span className="text-xs font-black uppercase tracking-widest text-primaryClr">
                    Required Measurements
                  </span>
                </div>

                <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar">
                  {(() => {
                    const itemType = selectedCustomer.items?.[activeItemIndex]?.itemType;
                    const mapping = {
                      Suit: ['chest', 'waist', 'hips', 'shoulder', 'sleeves', 'neck', 'length', 'pantLength', 'crotchDepth', 'hipDepth', 'waistArcFront', 'waistArcBack', 'hipArcFront', 'hipArcBack', 'bicep', 'capHeight'],
                      Shirt: ['chest', 'shoulder', 'sleeves', 'neck', 'length', 'fullLengthBack', 'fullLengthFront', 'acrossChest', 'acrossShoulder', 'shoulderLength', 'centerLength', 'shoulderSlope', 'acrossBack', 'backNeck'],
                      Trousers: ['waist', 'hips', 'inseam', 'length', 'pantLength', 'crotchDepth', 'hipDepth', 'waistArcFront', 'waistArcBack', 'hipArcFront', 'hipArcBack'],
                      Dress: ['chest', 'waist', 'hips', 'shoulder', 'length'],
                      Coat: ['chest', 'waist', 'shoulder', 'sleeves', 'length', 'bicep', 'capHeight']
                    };
                    const keysToShow = mapping[itemType] || Object.keys(selectedCustomer.measurements || {});

                    return keysToShow.map((key) => {
                      const val = selectedCustomer.measurements?.[key];
                      const cleanValue = parseFloat(val);
                      if (!cleanValue) return null;

                      const isHovered = hoveredMeasurement === key;

                      return (
                        <div
                          key={key}
                          onClick={() => setHoveredMeasurement(isHovered ? null : key)}
                          className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${isHovered
                            ? 'bg-primaryClr text-white border-primaryClr shadow-md scale-[1.02]'
                            : 'bg-white border-primaryClr/10 hover:border-primaryClr/30 hover:bg-primaryClr/[0.02]'
                            }`}
                        >
                          <span className={`text-[10px] uppercase font-bold tracking-widest whitespace-nowrap ${isHovered ? 'text-white/80' : 'text-secondaryClr/60'}`} title={key.replace(/([A-Z])/g, ' $1').trim()}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className={`text-sm font-black whitespace-nowrap ${isHovered ? 'text-white' : 'text-primaryClr'}`}>
                            {cleanValue} cm
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Master CAD Canvas */}
              <div className="w-full bg-backgroundClr rounded-xl border border-secondaryClr/20 p-0 relative flex flex-col min-h-[70vh] overflow-hidden shadow-inner group font-mono">

                {/* Standard CAD Grid overlay */}
                {showGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, var(--primaryClr, #075985) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--primaryClr, #075985) 1px, transparent 1px),
                        linear-gradient(to right, var(--primaryClr, #075985) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--primaryClr, #075985) 1px, transparent 1px)
                      `,
                      backgroundSize: '100px 100px, 100px 100px, 10px 10px, 10px 10px',
                      backgroundPosition: 'center center'
                    }}
                  />
                )}

                {/* CAD Axis Rulers */}
                {showGrid && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-5 bg-white border-b border-primaryClr/20 flex items-end px-5 z-10 select-none">
                      <div className="w-full h-full opacity-20" style={{ background: 'repeating-linear-gradient(to right, transparent, transparent 9px, var(--primaryClr, #075985) 9px, var(--primaryClr, #075985) 10px)' }} />
                    </div>
                    <div className="absolute top-0 left-0 bottom-0 w-5 bg-white border-r border-primaryClr/20 flex items-end py-5 z-10 select-none">
                      <div className="w-full h-full opacity-20" style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 9px, var(--primaryClr, #075985) 9px, var(--primaryClr, #075985) 10px)' }} />
                    </div>
                    <div className="absolute top-0 left-0 w-5 h-5 bg-white z-20 border-r border-b border-primaryClr/20" />
                  </>
                )}

                {/* Paper Pattern Information */}
                <div className="absolute top-8 left-8 text-xs font-mono text-[#6c757d] select-none pointer-events-none z-20 flex flex-col gap-1">
                  <span className="font-bold text-[#212529]">{selectedCustomer.items?.[activeItemIndex]?.itemType?.toUpperCase() || 'DRAFT'}</span>
                  <span>DIGITAL BLOCK</span>
                  <span>UNITS: CM</span>
                </div>

                {/* SVG Canvas - Centered */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-12 relative z-0 pb-16 pt-8">
                  {cadBlueprintData ? (
                    <svg
                      width={cadBlueprintData.viewBoxWidth}
                      height={cadBlueprintData.viewBoxHeight}
                      className="overflow-visible select-none cursor-crosshair"
                    >
                      {/* Seam allowance — dashed */}
                      {showSeams && cadBlueprintData.seamPath && (
                        <path
                          d={cadBlueprintData.seamPath}
                          fill="none"
                          stroke="currentColor"
                          className="text-primaryClr/40"
                          strokeWidth="1.2"
                          strokeDasharray="6 4"
                        />
                      )}

                      {/* Pattern Background Fill (transparent to match image) */}
                      <path
                        d={cadBlueprintData.path}
                        fill="transparent"
                      />

                      {/* Main pattern outline — exact red line from image */}
                      <path
                        d={cadBlueprintData.path}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="hover:stroke-red-600 transition-colors"
                      />

                      {/* Internal construction lines */}
                      {cadBlueprintData.internalLines?.map((line, lIdx) => (
                        <path
                          key={lIdx}
                          d={line.d || `M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`}
                          fill="none"
                          stroke={line.stroke || "currentColor"}
                          strokeWidth={line.strokeWidth || "1"}
                          strokeDasharray={line.dashArray}
                          className={line.stroke ? "" : "text-primaryClr opacity-40"}
                        />
                      ))}

                      {/* Guide labels - bold sans-serif text & dimensions */}
                      {cadBlueprintData.guideLabels?.map((label, lblIdx) => {
                        const isTitle = label.type === 'title' || label.type === 'title_blue';
                        const isDim = label.type === 'dim';
                        
                        let fillClass = "text-secondaryClr";
                        let fillHex = "currentColor";
                        if (label.type === 'label_red') fillHex = "#ef4444";
                        if (label.type === 'label_blue' || label.type === 'title_blue') fillHex = "#3b82f6";
                        if (isDim) fillClass = "text-primaryClr/60";

                        return (
                          <g key={lblIdx}>
                            <text
                              x={label.x}
                              y={label.y}
                              fontSize={isTitle ? "32" : (isDim ? "10" : "14")}
                              fontFamily="sans-serif"
                              fill={fillHex}
                              fontWeight={isDim ? "normal" : "bold"}
                              textAnchor={isTitle || isDim ? "middle" : "start"}
                              className={`pointer-events-none select-none ${fillHex === "currentColor" ? fillClass : ""}`}
                              transform={label.rotation ? `rotate(${label.rotation}, ${label.x}, ${label.y})` : undefined}
                            >
                              {label.text}
                            </text>
                          </g>
                        );
                      })}

                      {/* Hover annotations - realistic measurements */}
                      {showAnnotations && cadBlueprintData.annotations?.map((anno, aIdx) => {
                        const isActive = hoveredMeasurement === anno.key;
                        if (!isActive) return null;
                        const mx = (anno.x1 + anno.x2) / 2;
                        const my = (anno.y1 + anno.y2) / 2;
                        const labelW = anno.label.length * 7 + 10;
                        return (
                          <g key={aIdx}>
                            {/* Leader lines */}
                            <line x1={anno.x1} y1={anno.y1} x2={anno.x2} y2={anno.y2}
                              stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="text-primaryClr" />
                            {/* Tick marks */}
                            <circle cx={anno.x1} cy={anno.y1} r="3" fill="currentColor" className="text-primaryClr" />
                            <circle cx={anno.x2} cy={anno.y2} r="3" fill="currentColor" className="text-primaryClr" />

                            <rect x={mx - labelW / 2} y={my - 10} width={labelW} height={20}
                              fill="#ffffff" stroke="currentColor" strokeWidth="1" rx="4" className="text-primaryClr" />
                            <text x={mx} y={my + 4} textAnchor="middle"
                              fontSize="11" fill="currentColor" fontWeight="bold" fontFamily="sans-serif" className="text-primaryClr">
                              {anno.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#adb5bd] space-y-2">
                      <div className="w-12 h-12 border border-[#dee2e6] flex items-center justify-center bg-white rounded-full">
                        <Scissors className="w-5 h-5 text-[#adb5bd]" />
                      </div>
                      <p className="text-xs font-mono">NO PATTERN DATA</p>
                    </div>
                  )}
                </div>

                {/* Paper Status Bar Footer */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-white/80 backdrop-blur-md border-t border-primaryClr/10 flex justify-between items-center px-6 z-20 text-[10px] font-mono text-primaryClr/60 select-none">
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-secondaryClr"></span>
                      BLOCK
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-transparent border-t-2 border-solid border-primaryClr/40"></span>
                      SEAM
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-transparent border-t-2 border-dashed border-primaryClr/40"></span>
                      CONSTRUCTION
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => window.print()}
                      className="hover:text-primaryClr font-bold transition-colors flex items-center gap-2 bg-primaryClr/5 border border-primaryClr/10 px-4 py-1.5 rounded-lg text-secondaryClr">
                      ⎙ PRINT PATTERN
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Remove the redundant Measurement Summary Table completely since the sidebar handles it cleanly now */}
            {/* Added Style Notes Back if any, displayed clearly */}
            {(selectedCustomer.styleNotes || selectedCustomer.items?.[activeItemIndex]?.notes) && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-2">
                <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-widest mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Style Directives</span>
                </div>
                <div className="space-y-2 text-sm text-amber-900/80 font-medium">
                  {selectedCustomer.items?.[activeItemIndex]?.notes && (
                    <p><span className="font-bold">Item Directives:</span> {selectedCustomer.items[activeItemIndex].notes}</p>
                  )}
                  {selectedCustomer.styleNotes && (
                    <p><span className="font-bold">Order Notes:</span> {selectedCustomer.styleNotes}</p>
                  )}
                </div>
              </div>
            )}

            {/* Added Sample Image Display */}
            {(selectedCustomer.measurements?.sampleImage || selectedCustomer.orderSampleImage || selectedCustomer.items?.[activeItemIndex]?.sampleImage) && (
              <div className="bg-blue-50/60 border border-blue-200/50 rounded-2xl p-4 mt-2">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-widest mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Sample Image Reference</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {selectedCustomer.items?.[activeItemIndex]?.sampleImage && (
                    <a 
                      href={selectedCustomer.items[activeItemIndex].sampleImage} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                    >
                      View Garment Reference
                    </a>
                  )}
                  {selectedCustomer.orderSampleImage && (
                    <a 
                      href={selectedCustomer.orderSampleImage} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                    >
                      View Order Reference
                    </a>
                  )}
                  {selectedCustomer.measurements?.sampleImage && (
                    <a 
                      href={selectedCustomer.measurements.sampleImage} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                    >
                      View Profile Reference
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Workshop Instructions Panel removed as per user request */}

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