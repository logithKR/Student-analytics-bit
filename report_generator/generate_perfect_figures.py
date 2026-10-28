"""
generate_perfect_figures.py
Generates publication-grade, ultra-crisp, aesthetically flawless architecture diagrams
and flowcharts for the Academic Intelligence Platform report.
Replaces both:
  - images/fig3_1_system_architecture.png
  - images/fig3_2_ai_failover_flowchart.png
"""

import os
from PIL import Image, ImageDraw, ImageFont

FONTS_DIR = r"C:\Windows\Fonts"

def get_font(name="segoeui.ttf", size=14):
    try:
        return ImageFont.truetype(os.path.join(FONTS_DIR, name), size)
    except Exception:
        try:
            return ImageFont.truetype(os.path.join(FONTS_DIR, "arial.ttf"), size)
        except Exception:
            return ImageFont.load_default()

def draw_rounded_rect(draw, bbox, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def draw_shadow_rect(draw, bbox, radius, fill, outline=None, width=1, shadow_offset=(3, 3), shadow_color=(226, 232, 240, 220)):
    x0, y0, x1, y1 = bbox
    sx, sy = shadow_offset
    draw.rounded_rectangle((x0 + sx, y0 + sy, x1 + sx, y1 + sy), radius=radius, fill=shadow_color)
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def draw_pill(draw, xy, text, font, bg_color, text_color, pad_x=12, pad_y=4, outline=None):
    x, y = xy
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    w = tw + pad_x * 2
    h = th + pad_y * 2
    draw.rounded_rectangle((x, y, x + w, y + h), radius=h // 2, fill=bg_color, outline=outline, width=1 if outline else 0)
    draw.text((x + pad_x, y + pad_y - 1), text, fill=text_color, font=font)
    return w, h

def draw_arrow_orthogonal(draw, points, color="#334155", width=2, arrow_len=12, arrow_width=6):
    for i in range(len(points) - 1):
        draw.line([points[i], points[i+1]], fill=color, width=width)
    
    # Draw arrow head at the last segment
    p_prev = points[-2]
    p_last = points[-1]
    dx = p_last[0] - p_prev[0]
    dy = p_last[1] - p_prev[1]
    
    if dx == 0 and dy > 0: # Downward
        arrow = [(p_last[0] - arrow_width, p_last[1] - arrow_len),
                 (p_last[0] + arrow_width, p_last[1] - arrow_len),
                 (p_last[0], p_last[1])]
    elif dx == 0 and dy < 0: # Upward
        arrow = [(p_last[0] - arrow_width, p_last[1] + arrow_len),
                 (p_last[0] + arrow_width, p_last[1] + arrow_len),
                 (p_last[0], p_last[1])]
    elif dx > 0 and dy == 0: # Rightward
        arrow = [(p_last[0] - arrow_len, p_last[1] - arrow_width),
                 (p_last[0] - arrow_len, p_last[1] + arrow_width),
                 (p_last[0], p_last[1])]
    elif dx < 0 and dy == 0: # Leftward
        arrow = [(p_last[0] + arrow_len, p_last[1] - arrow_width),
                 (p_last[0] + arrow_len, p_last[1] + arrow_width),
                 (p_last[0], p_last[1])]
    else:
        arrow = []
    
    if arrow:
        draw.polygon(arrow, fill=color)

def generate_figure_3_1():
    W, H = 2600, 1750
    im = Image.new("RGBA", (W, H), (248, 250, 252, 255))
    draw = ImageDraw.Draw(im)

    # Fonts
    font_title = get_font("segoeuib.ttf", 36)
    font_subtitle = get_font("segoeui.ttf", 20)
    font_tier_hdr = get_font("segoeuib.ttf", 20)
    font_card_hdr = get_font("segoeuib.ttf", 19)
    font_card_sub = get_font("consola.ttf", 15)
    font_bullet = get_font("segoeui.ttf", 16)
    font_bullet_bold = get_font("segoeuib.ttf", 16)
    font_tag = get_font("segoeuib.ttf", 14)
    font_bus = get_font("segoeuib.ttf", 18)
    font_legend = get_font("segoeui.ttf", 16)
    font_conn_pill = get_font("segoeuib.ttf", 15)

    # 1. Main Title & Subtitle
    title_text = "ACADEMIC INTELLIGENCE PLATFORM — SYSTEM ARCHITECTURE"
    subtitle_text = "Decoupled Service-Oriented Framework: Client SPA, Asynchronous Core Services, Machine Learning & Failover AI"
    draw.text((W // 2, 45), title_text, fill="#0F172A", font=font_title, anchor="mt")
    draw.text((W // 2, 95), subtitle_text, fill="#475569", font=font_subtitle, anchor="mt")

    # Thin divider
    draw.line([(80, 132), (W - 80, 132)], fill="#E2E8F0", width=2)

    # =========================================================================
    # TIER 1: PRESENTATION TIER (CLIENT SPA)
    # =========================================================================
    t1_x0, t1_y0, t1_x1, t1_y1 = 70, 150, W - 70, 480
    draw_shadow_rect(draw, (t1_x0, t1_y0, t1_x1, t1_y1), radius=16, fill="#F0F7FF", outline="#93C5FD", width=2)

    # Header bar
    draw_rounded_rect(draw, (t1_x0, t1_y0, t1_x1, t1_y0 + 48), radius=16, fill="#1E3A8A")
    draw.rectangle((t1_x0, t1_y0 + 24, t1_x1, t1_y0 + 48), fill="#1E3A8A")
    draw.text((t1_x0 + 24, t1_y0 + 13), "TIER 1: PRESENTATION LAYER  —  CLIENT SINGLE-PAGE APPLICATION", fill="#FFFFFF", font=font_tier_hdr)

    # Tech badges on top right
    tx = t1_x1 - 20
    for tag in reversed(["React 19", "Vite 8", "Recharts 2.x", "Lucide Icons", "Tailwind CSS"]):
        bbox = font_tag.getbbox(tag)
        pw = bbox[2] - bbox[0] + 18
        tx -= pw
        draw.rounded_rectangle((tx, t1_y0 + 11, tx + pw, t1_y0 + 37), radius=13, fill="#2563EB")
        draw.text((tx + 9, t1_y0 + 14), tag, fill="#FFFFFF", font=font_tag)
        tx -= 10

    # 4 Presentation Cards
    cards_t1 = [
        {
            "title": "Executive KPI Dashboard",
            "tag": "Institutional Analytics",
            "bullets": [
                ("• Real-Time Metrics: ", "Total Enrolled, Pass %, GPA"),
                ("• Cohort Benchmarks: ", "Multi-Department Matrix"),
                ("• Distribution Radar: ", "Grade & Arrear Dispersion"),
                ("• Longitudinal Views: ", "Semester-wise Trajectory")
            ]
        },
        {
            "title": "ML Risk Prediction Hub",
            "tag": "Student Failure Early Warning",
            "bullets": [
                ("• Single Student ML: ", "Live Calibrated Risk %"),
                ("• Batch Scoring: ", "Cohort-wide Excel Ingestion"),
                ("• Action Flags: ", "Safe / Medium / High Risk"),
                ("• Advisory Matrix: ", "HOD & Mentor Alert Actions")
            ]
        },
        {
            "title": "Student Directory & Records",
            "tag": "Search & Academic Dossier",
            "bullets": [
                ("• Multi-Field Search: ", "Roll No, Name, Dept, Year"),
                ("• Dossier View: ", "Individual Semester SGPA History"),
                ("• Arrear Forensics: ", "Course-wise Failure Patterns"),
                ("• Score Explorer: ", "CIA vs End-Semester Analysis")
            ]
        },
        {
            "title": "Conversational AI Studio",
            "tag": "Interactive Visual Analytics",
            "bullets": [
                ("• Natural Language: ", "Freeform Institutional Queries"),
                ("• Dynamic Recharts: ", "12 Interactive Chart Types"),
                ("• Dynamic Toolbar: ", "Morph Bar / Line / Area / Pie"),
                ("• Client Export: ", "One-Click PNG, SVG & CSV Files")
            ]
        }
    ]

    card_w = (t1_x1 - t1_x0 - 50 - (len(cards_t1) - 1) * 24) // len(cards_t1)
    card_h = 240
    cy0 = t1_y0 + 64

    for i, c in enumerate(cards_t1):
        cx0 = t1_x0 + 25 + i * (card_w + 24)
        cx1 = cx0 + card_w
        cy1 = cy0 + card_h
        draw_shadow_rect(draw, (cx0, cy0, cx1, cy1), radius=12, fill="#FFFFFF", outline="#BFDBFE", width=1)
        
        # Top color accent line
        draw.rounded_rectangle((cx0 + 1, cy0 + 1, cx1 - 1, cy0 + 6), radius=3, fill="#3B82F6")
        
        # Title
        draw.text((cx0 + 16, cy0 + 16), c["title"], fill="#1E3A8A", font=font_card_hdr)
        
        # Sub-badge
        draw.rounded_rectangle((cx0 + 16, cy0 + 44, cx0 + 16 + font_card_sub.getbbox(c["tag"])[2] + 14, cy0 + 64), radius=4, fill="#EFF6FF")
        draw.text((cx0 + 23, cy0 + 47), c["tag"], fill="#2563EB", font=font_card_sub)

        # Bullets
        by = cy0 + 78
        for bold_prefix, regular_text in c["bullets"]:
            draw.text((cx0 + 16, by), bold_prefix, fill="#0F172A", font=font_bullet_bold)
            p_len = font_bullet_bold.getbbox(bold_prefix)[2] - font_bullet_bold.getbbox(bold_prefix)[0]
            draw.text((cx0 + 16 + p_len, by), regular_text, fill="#334155", font=font_bullet)
            by += 36

    # =========================================================================
    # PROTOCOL BUS / GATEWAY (BETWEEN TIER 1 & TIER 2)
    # =========================================================================
    bus_x0, bus_y0, bus_x1, bus_y1 = 280, 508, W - 280, 562
    draw_shadow_rect(draw, (bus_x0, bus_y0, bus_x1, bus_y1), radius=10, fill="#0F172A", outline="#334155", width=2)
    bus_text = "▲▼   ASYNCHRONOUS RESTful API GATEWAY  •  JSON PAYLOADS  •  CORS MIDDLEWARE  •  PYDANTIC v2 VALIDATION  •  ASGI UVICORN   ▲▼"
    draw.text(((bus_x0 + bus_x1) // 2, (bus_y0 + bus_y1) // 2 - 1), bus_text, fill="#38BDF8", font=font_bus, anchor="mm")

    # Connector lines from Tier 1 to Bus and Bus to Tier 2
    for pos_x in [W // 2 - 600, W // 2 - 200, W // 2 + 200, W // 2 + 600]:
        draw_arrow_orthogonal(draw, [(pos_x, t1_y1), (pos_x, bus_y0)], color="#0284C7", width=3, arrow_len=8, arrow_width=5)
        draw_arrow_orthogonal(draw, [(pos_x, bus_y0), (pos_x, t1_y1)], color="#0284C7", width=3, arrow_len=8, arrow_width=5)
        draw_arrow_orthogonal(draw, [(pos_x, bus_y1), (pos_x, 590)], color="#059669", width=3, arrow_len=8, arrow_width=5)
        draw_arrow_orthogonal(draw, [(pos_x, 590), (pos_x, bus_y1)], color="#059669", width=3, arrow_len=8, arrow_width=5)

    # =========================================================================
    # TIER 2: APPLICATION & SERVICES TIER (FASTAPI ASYNC ENGINE)
    # =========================================================================
    t2_x0, t2_y0, t2_x1, t2_y1 = 70, 590, W - 70, 935
    draw_shadow_rect(draw, (t2_x0, t2_y0, t2_x1, t2_y1), radius=16, fill="#F0FDF4", outline="#86EFAC", width=2)

    # Header bar
    draw_rounded_rect(draw, (t2_x0, t2_y0, t2_x1, t2_y0 + 48), radius=16, fill="#065F46")
    draw.rectangle((t2_x0, t2_y0 + 24, t2_x1, t2_y0 + 48), fill="#065F46")
    draw.text((t2_x0 + 24, t2_y0 + 13), "TIER 2: APPLICATION & CORE SERVICES LAYER  —  FASTAPI ASYNC ENGINE", fill="#FFFFFF", font=font_tier_hdr)

    # Tech badges on top right
    tx = t2_x1 - 20
    for tag in reversed(["FastAPI 0.115", "Python 3.12", "XGBoost 2.1", "Pandas 2.2", "Uvicorn ASGI"]):
        bbox = font_tag.getbbox(tag)
        pw = bbox[2] - bbox[0] + 18
        tx -= pw
        draw.rounded_rectangle((tx, t2_y0 + 11, tx + pw, t2_y0 + 37), radius=13, fill="#059669")
        draw.text((tx + 9, t2_y0 + 14), tag, fill="#FFFFFF", font=font_tag)
        tx -= 10

    # 4 Service Cards
    cards_t2 = [
        {
            "title": "Data Aggregator & Ingestion",
            "file": "backend/services/data_service.py",
            "bullets": [
                ("• Dynamic Schema: ", "Auto Header & Column Mapping"),
                ("• Ingestion: ", "61 Department Result Workbooks"),
                ("• Normalization: ", "0-100% Internal Scale Harmonizer"),
                ("• GPA Engine: ", "10-Point University Regulation Rules"),
                ("• Data Cache: ", "High-Speed In-Memory DataFrames")
            ]
        },
        {
            "title": "XGBoost ML Risk Engine",
            "file": "backend/services/model_service.py",
            "bullets": [
                ("• Supervised ML: ", "Calibrated XGBClassifier Model"),
                ("• Features: ", "Avg_Internal, Min_Internal, Low_Count"),
                ("• Risk Banding: ", "Safe (<30%), Med (30-65%), High (>65%)"),
                ("• Low Latency: ", "<15ms Deterministic Inference Time"),
                ("• Batch Scoring: ", "Full Department Real-time Triage")
            ]
        },
        {
            "title": "Conversational AI Planner",
            "file": "backend/services/ai_service.py",
            "bullets": [
                ("• Zero-Token Cache: ", "Instant Local Intent Rule Engine"),
                ("• LLM Planner: ", "Natural Language Query Synthesis"),
                ("• Graph Spec: ", "Generates 12 Recharts Visual Configs"),
                ("• Auto-Repair: ", "validate_and_repair_specification()"),
                ("• Failover Logic: ", "Auto Multi-Key Pool & Model Cascade")
            ]
        },
        {
            "title": "Audit Logger & Telemetry",
            "file": "backend/services/logger_service.py",
            "bullets": [
                ("• Query Telemetry: ", "Prompt, Intent, Plan Execution Logs"),
                ("• Latency Tracker: ", "Sub-Millisecond System Timestamps"),
                ("• Persistent Store: ", "ai_query_logs.json Storage"),
                ("• Fault Monitor: ", "Tracks 429 Rate Limits & Key Rotations"),
                ("• Health Check: ", "Continuous Endpoint Diagnostic Heartbeat")
            ]
        }
    ]

    cy0 = t2_y0 + 64
    card_h2 = 262

    for i, c in enumerate(cards_t2):
        cx0 = t2_x0 + 25 + i * (card_w + 24)
        cx1 = cx0 + card_w
        cy1 = cy0 + card_h2
        draw_shadow_rect(draw, (cx0, cy0, cx1, cy1), radius=12, fill="#FFFFFF", outline="#A7F3D0", width=1)
        
        # Top color accent line
        draw.rounded_rectangle((cx0 + 1, cy0 + 1, cx1 - 1, cy0 + 6), radius=3, fill="#10B981")
        
        # Title
        draw.text((cx0 + 16, cy0 + 15), c["title"], fill="#065F46", font=font_card_hdr)
        
        # File path badge
        f_bbox = font_card_sub.getbbox(c["file"])
        f_w = f_bbox[2] - f_bbox[0] + 16
        draw.rounded_rectangle((cx0 + 16, cy0 + 42, cx0 + 16 + f_w, cy0 + 62), radius=4, fill="#ECFDF5")
        draw.text((cx0 + 24, cy0 + 44), c["file"], fill="#059669", font=font_card_sub)

        # Bullets
        by = cy0 + 72
        for bold_prefix, regular_text in c["bullets"]:
            draw.text((cx0 + 16, by), bold_prefix, fill="#0F172A", font=font_bullet_bold)
            p_len = font_bullet_bold.getbbox(bold_prefix)[2] - font_bullet_bold.getbbox(bold_prefix)[0]
            draw.text((cx0 + 16 + p_len, by), regular_text, fill="#334155", font=font_bullet)
            by += 34

    # =========================================================================
    # REFINED CONNECTORS (TIER 2 -> TIER 3 & 4) - NO OVERLAPPING!
    # =========================================================================
    # Connector 1: Left (Tier 2 -> Tier 3)
    conn1_cx = t1_x0 + 580
    pill1_w, pill1_h = 520, 36
    pill1_x0, pill1_y0 = conn1_cx - pill1_w // 2, 950
    # Top arrow: Tier 2 bottom to pill top
    draw_arrow_orthogonal(draw, [(conn1_cx, t2_y1), (conn1_cx, pill1_y0)], color="#D97706", width=3, arrow_len=7, arrow_width=5)
    draw_arrow_orthogonal(draw, [(conn1_cx, pill1_y0), (conn1_cx, t2_y1)], color="#D97706", width=3, arrow_len=7, arrow_width=5)
    # Connector pill
    draw_rounded_rect(draw, (pill1_x0, pill1_y0, pill1_x0 + pill1_w, pill1_y0 + pill1_h), radius=8, fill="#FEF3C7", outline="#F59E0B", width=1)
    draw.text((conn1_cx, pill1_y0 + pill1_h // 2 - 1), "Joblib Model Loading  •  OpenPyXL / Pandas Ingestion", fill="#92400E", font=font_conn_pill, anchor="mm")
    # Bottom arrow: pill bottom to Tier 3 top
    draw_arrow_orthogonal(draw, [(conn1_cx, pill1_y0 + pill1_h), (conn1_cx, 1000)], color="#D97706", width=3, arrow_len=7, arrow_width=5)
    draw_arrow_orthogonal(draw, [(conn1_cx, 1000), (conn1_cx, pill1_y0 + pill1_h)], color="#D97706", width=3, arrow_len=7, arrow_width=5)

    # Connector 2: Right (Tier 2 -> Tier 4)
    conn2_cx = W - t1_x0 - 580
    pill2_w, pill2_h = 520, 36
    pill2_x0, pill2_y0 = conn2_cx - pill2_w // 2, 950
    # Top arrow: Tier 2 bottom to pill top
    draw_arrow_orthogonal(draw, [(conn2_cx, t2_y1), (conn2_cx, pill2_y0)], color="#7C3AED", width=3, arrow_len=7, arrow_width=5)
    draw_arrow_orthogonal(draw, [(conn2_cx, pill2_y0), (conn2_cx, t2_y1)], color="#7C3AED", width=3, arrow_len=7, arrow_width=5)
    # Connector pill
    draw_rounded_rect(draw, (pill2_x0, pill2_y0, pill2_x0 + pill2_w, pill2_y0 + pill2_h), radius=8, fill="#F3E8FF", outline="#A855F7", width=1)
    draw.text((conn2_cx, pill2_y0 + pill2_h // 2 - 1), "HTTPS REST API  •  Multi-Key Failover Pool  •  JSON Specs", fill="#6B21A8", font=font_conn_pill, anchor="mm")
    # Bottom arrow: pill bottom to Tier 4 top
    draw_arrow_orthogonal(draw, [(conn2_cx, pill2_y0 + pill2_h), (conn2_cx, 1000)], color="#7C3AED", width=3, arrow_len=7, arrow_width=5)
    draw_arrow_orthogonal(draw, [(conn2_cx, 1000), (conn2_cx, pill2_y0 + pill2_h)], color="#7C3AED", width=3, arrow_len=7, arrow_width=5)

    # =========================================================================
    # TIER 3: DATA & MODEL REPOSITORY (LOCAL / PERSISTENT)
    # =========================================================================
    t3_x0, t3_y0, t3_x1, t3_y1 = 70, 1000, W // 2 - 20, 1630
    draw_shadow_rect(draw, (t3_x0, t3_y0, t3_x1, t3_y1), radius=16, fill="#FFFBEB", outline="#FCD34D", width=2)

    # Header bar
    draw_rounded_rect(draw, (t3_x0, t3_y0, t3_x1, t3_y0 + 48), radius=16, fill="#92400E")
    draw.rectangle((t3_x0, t3_y0 + 24, t3_x1, t3_y0 + 48), fill="#92400E")
    draw.text((t3_x0 + 24, t3_y0 + 13), "TIER 3: DATA & MODEL REPOSITORY (ON-PREM / LOCAL)", fill="#FFFFFF", font=font_tier_hdr)

    tx = t3_x1 - 20
    for tag in reversed(["OpenPyXL", "Joblib", "JSON Logs"]):
        bbox = font_tag.getbbox(tag)
        pw = bbox[2] - bbox[0] + 18
        tx -= pw
        draw.rounded_rectangle((tx, t3_y0 + 11, tx + pw, t3_y0 + 37), radius=13, fill="#D97706")
        draw.text((tx + 9, t3_y0 + 14), tag, fill="#FFFFFF", font=font_tag)
        tx -= 10

    # 3 Sub-Cards for Tier 3
    t3_cards = [
        {
            "title": "Institutional Academic Records Store",
            "file": "backend/data/UG/<DEPT>/<SEMESTER>/*-CONS-WO.xlsx",
            "bullets": [
                ("• Institutional Coverage: ", "61 Consolidated Workbooks across 20 Engineering Branches (CS, IT, AD, ME, etc.)"),
                ("• Normalized Fields: ", "Student Roll No, Name, Continuous Internal Marks (CIA), End-Sem Scores, Grade Points, SGPA"),
                ("• In-Memory DataFrame Caching: ", "Dynamic indexing on primary academic keys for instant sub-10ms cohort lookups")
            ]
        },
        {
            "title": "Serialized Machine Learning Artifacts",
            "file": "backend/models/xgboost_model.joblib",
            "bullets": [
                ("• Predictive Model Artifact: ", "Trained XGBoost Binary Classifier with Calibrated Probability Estimates"),
                ("• Feature Decision Weights: ", "Pre-computed split nodes optimized for failure probability boundary detection"),
                ("• Runtime Deserialization: ", "Sub-5ms Joblib deserialization into active FastAPI inference memory space")
            ]
        },
        {
            "title": "Transactional Audit & Telemetry Store",
            "file": "backend/logs/ai_query_logs.json",
            "bullets": [
                ("• Telemetry History: ", "Complete chronologically timestamped record of user natural language queries"),
                ("• Analytical Metrics: ", "Intent classification confidence, LLM token counts, response latencies"),
                ("• Fault Recovery History: ", "HTTP 429 rate limit triggers, API key rotation events, fallback model activations")
            ]
        }
    ]

    c3_w = t3_x1 - t3_x0 - 50
    c3_h = 160
    c3_y0 = t3_y0 + 64

    for i, c in enumerate(t3_cards):
        cy = c3_y0 + i * (c3_h + 18)
        draw_shadow_rect(draw, (t3_x0 + 25, cy, t3_x0 + 25 + c3_w, cy + c3_h), radius=10, fill="#FFFFFF", outline="#FDE68A", width=1)
        draw.rounded_rectangle((t3_x0 + 26, cy + 1, t3_x0 + 25 + c3_w - 1, cy + 5), radius=2, fill="#F59E0B")
        draw.text((t3_x0 + 40, cy + 14), c["title"], fill="#92400E", font=font_card_hdr)
        
        # File badge
        f_bbox = font_card_sub.getbbox(c["file"])
        f_w = f_bbox[2] - f_bbox[0] + 16
        draw.rounded_rectangle((t3_x0 + 40, cy + 42, t3_x0 + 40 + f_w, cy + 62), radius=4, fill="#FEF3C7")
        draw.text((t3_x0 + 48, cy + 44), c["file"], fill="#B45309", font=font_card_sub)

        by = cy + 74
        for bold_prefix, regular_text in c["bullets"]:
            draw.text((t3_x0 + 40, by), bold_prefix, fill="#0F172A", font=font_bullet_bold)
            p_len = font_bullet_bold.getbbox(bold_prefix)[2] - font_bullet_bold.getbbox(bold_prefix)[0]
            draw.text((t3_x0 + 40 + p_len, by), regular_text, fill="#334155", font=font_bullet)
            by += 26

    # =========================================================================
    # TIER 4: GROQ CLOUD LPU INFERENCE POOL (EXTERNAL AI)
    # =========================================================================
    t4_x0, t4_y0, t4_x1, t4_y1 = W // 2 + 20, 1000, W - 70, 1630
    draw_shadow_rect(draw, (t4_x0, t4_y0, t4_x1, t4_y1), radius=16, fill="#FAF5FF", outline="#D8B4FE", width=2)

    # Header bar
    draw_rounded_rect(draw, (t4_x0, t4_y0, t4_x1, t4_y0 + 48), radius=16, fill="#581C87")
    draw.rectangle((t4_x0, t4_y0 + 24, t4_x1, t4_y0 + 48), fill="#581C87")
    draw.text((t4_x0 + 24, t4_y0 + 13), "TIER 4: GROQ CLOUD INFERENCE POOL (HIGH-SPEED LPU TENSOR)", fill="#FFFFFF", font=font_tier_hdr)

    tx = t4_x1 - 20
    for tag in reversed(["Groq LPU", "Multi-Key Pool", "Failover Mesh", "3 Models"]):
        bbox = font_tag.getbbox(tag)
        pw = bbox[2] - bbox[0] + 18
        tx -= pw
        draw.rounded_rectangle((tx, t4_y0 + 11, tx + pw, t4_y0 + 37), radius=13, fill="#7C3AED")
        draw.text((tx + 9, t4_y0 + 14), tag, fill="#FFFFFF", font=font_tag)
        tx -= 10

    # 3 Sub-Cards for Tier 4
    t4_cards = [
        {
            "title": "Primary High-Speed Inference Engine",
            "file": "Model: openai/gpt-oss-120b (Groq Tensor Streaming)",
            "bullets": [
                ("• Natural Language Planner: ", "Decomposes complex analytical prompts into formal execution plans"),
                ("• Structured Graph Output: ", "Generates strict JSON specifications { intent, filters, metrics, chartType }"),
                ("• High-Throughput SLA: ", "Sub-second generation latency powered by Groq Language Processing Units")
            ]
        },
        {
            "title": "Multi-Key Dynamic Failover Pool",
            "file": "Key Rotation: GROQ_API_KEY_1 -> KEY_2 -> KEY_3",
            "bullets": [
                ("• Zero Downtime Switching: ", "Automatic round-robin key switching upon receiving HTTP 429 Rate Limit error"),
                ("• Quota Load Balancing: ", "Distributes institutional request bursts across independent API key quotas"),
                ("• Seamless Request Replay: ", "Transparent request replay without user interruption or frontend error alerts")
            ]
        },
        {
            "title": "Cascading Fallback Model Architecture",
            "file": "Fallback: gpt-oss-120b -> gpt-oss-20b -> qwen/qwen3.8-27b",
            "bullets": [
                ("• Tiered Model Degradation: ", "Cascades to secondary lightweight models if primary model is throttled"),
                ("• Strict Output Parity: ", "Robust prompt engineering guarantees identical JSON specification structure"),
                ("• Resilient Chart Delivery: ", "Frontend chart generation succeeds 100% of the time under heavy concurrency")
            ]
        }
    ]

    for i, c in enumerate(t4_cards):
        cy = c3_y0 + i * (c3_h + 18)
        draw_shadow_rect(draw, (t4_x0 + 25, cy, t4_x0 + 25 + c3_w, cy + c3_h), radius=10, fill="#FFFFFF", outline="#E9D5FF", width=1)
        draw.rounded_rectangle((t4_x0 + 26, cy + 1, t4_x0 + 25 + c3_w - 1, cy + 5), radius=2, fill="#A855F7")
        draw.text((t4_x0 + 40, cy + 14), c["title"], fill="#581C87", font=font_card_hdr)
        
        # File badge
        f_bbox = font_card_sub.getbbox(c["file"])
        f_w = f_bbox[2] - f_bbox[0] + 16
        draw.rounded_rectangle((t4_x0 + 40, cy + 42, t4_x0 + 40 + f_w, cy + 62), radius=4, fill="#F3E8FF")
        draw.text((t4_x0 + 48, cy + 44), c["file"], fill="#7E22CE", font=font_card_sub)

        by = cy + 74
        for bold_prefix, regular_text in c["bullets"]:
            draw.text((t4_x0 + 40, by), bold_prefix, fill="#0F172A", font=font_bullet_bold)
            p_len = font_bullet_bold.getbbox(bold_prefix)[2] - font_bullet_bold.getbbox(bold_prefix)[0]
            draw.text((t4_x0 + 40 + p_len, by), regular_text, fill="#334155", font=font_bullet)
            by += 26

    # =========================================================================
    # SYSTEM FOOTER / LEGEND BAR
    # =========================================================================
    foot_y0 = 1655
    draw_rounded_rect(draw, (70, foot_y0, W - 70, foot_y0 + 50), radius=10, fill="#0F172A")
    
    legend_items = [
        ("#3B82F6", "Client Presentation Tier (React 19 SPA)"),
        ("#10B981", "FastAPI Core Application Tier (Python 3.12)"),
        ("#F59E0B", "Persistent Storage & Model Store"),
        ("#A855F7", "Groq Cloud LPU Inference Pool"),
        ("#38BDF8", "RESTful Asynchronous Bus"),
        ("#E2E8F0", "Calibrated XGBoost ML Risk Engine (<15ms Latency)")
    ]
    lx = 100
    for color, text in legend_items:
        draw.rounded_rectangle((lx, foot_y0 + 18, lx + 14, foot_y0 + 32), radius=3, fill=color)
        draw.text((lx + 22, foot_y0 + 15), text, fill="#F8FAFC", font=font_legend)
        lx += font_legend.getbbox(text)[2] - font_legend.getbbox(text)[0] + 55

    os.makedirs("images", exist_ok=True)
    out_path = "images/fig3_1_system_architecture.png"
    im.save(out_path, "PNG", dpi=(300, 300))
    print(f"Flawless Figure 3.1 saved to {out_path} ({W}x{H})")

def generate_figure_3_2():
    W, H = 2200, 1680
    im = Image.new("RGBA", (W, H), (248, 250, 252, 255))
    draw = ImageDraw.Draw(im)

    # Fonts
    font_title = get_font("segoeuib.ttf", 32)
    font_subtitle = get_font("segoeui.ttf", 18)
    font_node_hdr = get_font("segoeuib.ttf", 19)
    font_node_sub = get_font("segoeui.ttf", 15)
    font_bullet_bold = get_font("segoeuib.ttf", 15)
    font_code = get_font("consola.ttf", 14)
    font_lbl = get_font("segoeuib.ttf", 14)
    font_badge = get_font("segoeuib.ttf", 13)
    font_legend = get_font("segoeui.ttf", 15)

    # Title
    draw.text((W // 2, 40), "END-TO-END CONVERSATIONAL AI & FAILOVER EXECUTION FLOW", fill="#0F172A", font=font_title, anchor="mt")
    draw.text((W // 2, 85), "Dual-Path Execution: Zero-Token Local Caching, Multi-Key LLM Planner, Automated 429 Failover & Self-Repair", fill="#475569", font=font_subtitle, anchor="mt")
    draw.line([(80, 120), (W - 80, 120)], fill="#E2E8F0", width=2)

    cx = W // 2

    # Node 1: User Prompt
    n1_w, n1_h = 960, 95
    n1_x0, n1_y0 = cx - n1_w // 2, 145
    draw_shadow_rect(draw, (n1_x0, n1_y0, n1_x0 + n1_w, n1_y0 + n1_h), radius=12, fill="#EFF6FF", outline="#3B82F6", width=2)
    draw.text((cx, n1_y0 + 26), "Natural Language User Query Input", fill="#1E3A8A", font=font_node_hdr, anchor="mm")
    draw.text((cx, n1_y0 + 60), 'e.g., "Compare pass percentage of CS, IT, and ME with CGPA > 8.0" or "Show top 10 students in CSE"', fill="#1E40AF", font=font_code, anchor="mm")

    # Arrow 1 -> Node 2
    draw_arrow_orthogonal(draw, [(cx, n1_y0 + n1_h), (cx, 280)], color="#2563EB", width=3, arrow_len=10, arrow_width=6)

    # Node 2: Intent Evaluator & Query Router
    n2_w, n2_h = 1040, 105
    n2_x0, n2_y0 = cx - n2_w // 2, 280
    draw_shadow_rect(draw, (n2_x0, n2_y0, n2_x0 + n2_w, n2_y0 + n2_h), radius=12, fill="#FEF3C7", outline="#F59E0B", width=2)
    draw.text((cx, n2_y0 + 28), "Intent Evaluator & Dual-Path Router (backend/services/ai_service.py)", fill="#92400E", font=font_node_hdr, anchor="mm")
    draw.text((cx, n2_y0 + 64), "Regex Pattern Matcher & Local Cache: Detects Standard Pre-Compiled Queries vs. Ad-Hoc Analytics", fill="#B45309", font=font_node_sub, anchor="mm")

    # BRANCHING PATHS:
    # -------------------------------------------------------------
    # PATH A: Left Side -> Zero-Token Local Caching Execution
    left_x = 350
    # Line from Node 2 left side to left_x
    draw_arrow_orthogonal(draw, [(n2_x0, n2_y0 + n2_h // 2), (left_x, n2_y0 + n2_h // 2), (left_x, 480)], color="#059669", width=3, arrow_len=10, arrow_width=6)
    
    # Pill label on left path
    draw_pill(draw, (left_x - 14, 380), "MATCHED: Standard Query Pattern", font_lbl, "#D1FAE5", "#065F46", pad_x=12, pad_y=6, outline="#059669")

    # Node 3A: Zero-Token Local Planner
    n3a_w, n3a_h = 560, 165
    n3a_x0, n3a_y0 = left_x - n3a_w // 2, 480
    draw_shadow_rect(draw, (n3a_x0, n3a_y0, n3a_x0 + n3a_w, n3a_y0 + n3a_h), radius=12, fill="#ECFDF5", outline="#10B981", width=2)
    draw.rounded_rectangle((n3a_x0 + 1, n3a_y0 + 1, n3a_x0 + n3a_w - 1, n3a_y0 + 6), radius=3, fill="#059669")
    draw.text((left_x, n3a_y0 + 30), "Zero-Token Local Execution Engine", fill="#065F46", font=font_node_hdr, anchor="mm")
    draw.text((left_x, n3a_y0 + 66), "• Instant Pre-Compiled Graph Specification Synthesis", fill="#047857", font=font_node_sub, anchor="mm")
    draw.text((left_x, n3a_y0 + 98), "• 0 Cloud LLM Tokens Consumed  •  Latency < 10ms", fill="#047857", font=font_bullet_bold, anchor="mm")
    draw.text((left_x, n3a_y0 + 130), "• Top Performers, Grade Counts, Department Benchmarks", fill="#065F46", font=font_code, anchor="mm")

    # -------------------------------------------------------------
    # PATH B: Center / Right -> Groq LLM Query Planner & Failover Loop
    center_y_planner = 480
    draw_arrow_orthogonal(draw, [(cx + 60, n2_y0 + n2_h), (cx + 60, center_y_planner)], color="#7C3AED", width=3, arrow_len=10, arrow_width=6)
    draw_pill(draw, (cx - 70, 405), "UNMATCHED: Ad-Hoc / Complex Query", font_lbl, "#F3E8FF", "#581C87", pad_x=12, pad_y=6, outline="#7C3AED")

    # Node 3B: Groq Primary Planner
    n3b_w, n3b_h = 700, 175
    n3b_x0, n3b_y0 = cx - n3b_w // 2 + 60, center_y_planner
    draw_shadow_rect(draw, (n3b_x0, n3b_y0, n3b_x0 + n3b_w, n3b_y0 + n3b_h), radius=12, fill="#FAF5FF", outline="#A855F7", width=2)
    draw.rounded_rectangle((n3b_x0 + 1, n3b_y0 + 1, n3b_x0 + n3b_w - 1, n3b_y0 + 6), radius=3, fill="#7C3AED")
    draw.text((n3b_x0 + n3b_w // 2, n3b_y0 + 30), "Groq LLM Query Planner (Primary)", fill="#581C87", font=font_node_hdr, anchor="mm")
    draw.text((n3b_x0 + n3b_w // 2, n3b_y0 + 66), "Primary Model: openai/gpt-oss-120b on Groq LPU Hardware", fill="#6B21A8", font=font_node_sub, anchor="mm")
    draw.text((n3b_x0 + n3b_w // 2, n3b_y0 + 98), "Zero-shot extraction of entities, filters, aggregations & visual types", fill="#4C1D95", font=font_node_sub, anchor="mm")
    draw.text((n3b_x0 + n3b_w // 2, n3b_y0 + 132), "Multi-turn schema prompts with strict JSON graph grammar", fill="#6B21A8", font=font_code, anchor="mm")

    # FAILOVER ENGINE NODE (RIGHT SIDE OF 3B)
    n_fail_w, n_fail_h = 440, 205
    n_fail_x0, n_fail_y0 = W - n_fail_w - 60, center_y_planner - 15
    draw_shadow_rect(draw, (n_fail_x0, n_fail_y0, n_fail_x0 + n_fail_w, n_fail_y0 + n_fail_h), radius=12, fill="#FFF1F2", outline="#F43F5E", width=2)
    draw.rounded_rectangle((n_fail_x0 + 1, n_fail_y0 + 1, n_fail_x0 + n_fail_w - 1, n_fail_y0 + 6), radius=3, fill="#E11D48")
    draw.text((n_fail_x0 + n_fail_w // 2, n_fail_y0 + 26), "Automated Failover Engine", fill="#9F1239", font=font_node_hdr, anchor="mm")
    draw.text((n_fail_x0 + n_fail_w // 2, n_fail_y0 + 60), "1. Dynamic API Key Rotation Pool:", fill="#881337", font=font_bullet_bold, anchor="mm")
    draw.text((n_fail_x0 + n_fail_w // 2, n_fail_y0 + 86), "Key 1 -> Key 2 -> Key 3 (Round-Robin)", fill="#BE123C", font=font_code, anchor="mm")
    draw.text((n_fail_x0 + n_fail_w // 2, n_fail_y0 + 118), "2. Cascading Fallback Models:", fill="#881337", font=font_bullet_bold, anchor="mm")
    draw.text((n_fail_x0 + n_fail_w // 2, n_fail_y0 + 144), "gpt-oss-120b -> 20b -> qwen3.8-27b", fill="#BE123C", font=font_code, anchor="mm")
    draw.text((n_fail_x0 + n_fail_w // 2, n_fail_y0 + 176), "Ensures 100% Query Uptime SLA", fill="#047857", font=font_bullet_bold, anchor="mm")

    # -------------------------------------------------------------
    # FLAWLESS FAILOVER LOOP (NO CROSSING TEXT OR BOXES)
    # -------------------------------------------------------------
    # 1. Outward on 429: from right edge of 3B into left edge of Failover Box
    arrow_y_out = center_y_planner + 50
    draw_arrow_orthogonal(draw, [(n3b_x0 + n3b_w, arrow_y_out), (n_fail_x0, arrow_y_out)], color="#E11D48", width=3, arrow_len=10, arrow_width=6)
    draw_pill(draw, (n3b_x0 + n3b_w + 12, arrow_y_out - 30), "HTTP 429 Rate Limit", font_badge, "#FFE4E6", "#9F1239", pad_x=8, pad_y=4, outline="#E11D48")

    # 2. Return loop: From top edge of Failover Box, UP above, LEFT, then DOWN into top edge of Planner
    loop_up_y = center_y_planner - 45
    loop_entry_x = n3b_x0 + n3b_w - 80
    draw_arrow_orthogonal(draw, [
        (n_fail_x0 + 120, n_fail_y0),
        (n_fail_x0 + 120, loop_up_y),
        (loop_entry_x, loop_up_y),
        (loop_entry_x, center_y_planner)
    ], color="#059669", width=3, arrow_len=10, arrow_width=6)
    draw_pill(draw, (loop_entry_x + 40, loop_up_y - 14), "Rotate Key / Cascade Model (Retry)", font_badge, "#D1FAE5", "#065F46", pad_x=10, pad_y=4, outline="#059669")

    # 3. Success Path Down from Groq Planner on HTTP 200
    plan_out_x = n3b_x0 + n3b_w // 2 - 80
    draw_arrow_orthogonal(draw, [(plan_out_x, n3b_y0 + n3b_h), (plan_out_x, 725)], color="#7C3AED", width=3, arrow_len=10, arrow_width=6)
    draw_pill(draw, (plan_out_x - 120, 675), "HTTP 200 OK: Structured JSON Plan Generated", font_lbl, "#F3E8FF", "#581C87", pad_x=10, pad_y=4, outline="#7C3AED")

    # Node 4: Structured Query Plan & Specification JSON
    n4_w, n4_h = 920, 115
    n4_x0, n4_y0 = cx - 120, 725
    draw_shadow_rect(draw, (n4_x0, n4_y0, n4_x0 + n4_w, n4_y0 + n4_h), radius=12, fill="#F0FDF4", outline="#22C55E", width=2)
    draw.rounded_rectangle((n4_x0 + 1, n4_y0 + 1, n4_x0 + n4_w - 1, n4_y0 + 6), radius=3, fill="#16A34A")
    draw.text((n4_x0 + n4_w // 2, n4_y0 + 26), "Structured Query Plan & Graph Specification Artifact", fill="#14532D", font=font_node_hdr, anchor="mm")
    draw.text((n4_x0 + n4_w // 2, n4_y0 + 58), '{ "intent": "comparison", "entity": "student", "filters": [...], "metrics": [...] }', fill="#166534", font=font_code, anchor="mm")
    draw.text((n4_x0 + n4_w // 2, n4_y0 + 86), '{ "visualization": "grouped-bar", "xAxis": "dept", "yAxis": "pass_pct" }', fill="#166534", font=font_code, anchor="mm")

    # -------------------------------------------------------------
    # MERGING PATHS INTO NODE 5 (SYMMETRICAL, ZERO COLLISION)
    # -------------------------------------------------------------
    # Left path (from Node 3A):
    merge_y = 880
    draw_arrow_orthogonal(draw, [
        (left_x, n3a_y0 + n3a_h),
        (left_x, merge_y),
        (cx - 240, merge_y),
        (cx - 240, 915)
    ], color="#059669", width=3, arrow_len=10, arrow_width=6)
    draw_pill(draw, (left_x - 30, 790), "Local Spec Generated (0-Token)", font_lbl, "#D1FAE5", "#065F46", pad_x=10, pad_y=4, outline="#059669")

    # Center path (from Node 4):
    draw_arrow_orthogonal(draw, [
        (n4_x0 + n4_w // 2, n4_y0 + n4_h),
        (n4_x0 + n4_w // 2, merge_y),
        (cx + 240, merge_y),
        (cx + 240, 915)
    ], color="#16A34A", width=3, arrow_len=10, arrow_width=6)
    draw_pill(draw, (n4_x0 + n4_w // 2 + 10, 855), "LLM Spec Generated", font_lbl, "#DCFCE7", "#15803D", pad_x=10, pad_y=4, outline="#16A34A")

    # Node 5: Schema Validation & Self-Healing Repair Engine
    n5_w, n5_h = 1260, 120
    n5_x0, n5_y0 = cx - n5_w // 2, 915
    draw_shadow_rect(draw, (n5_x0, n5_y0, n5_x0 + n5_w, n5_y0 + n5_h), radius=12, fill="#F8FAFC", outline="#64748B", width=2)
    draw.rounded_rectangle((n5_x0 + 1, n5_y0 + 1, n5_x0 + n5_w - 1, n5_y0 + 6), radius=3, fill="#475569")
    draw.text((cx, n5_y0 + 28), "Specification Validator & Self-Repair Engine (validate_and_repair_specification)", fill="#0F172A", font=font_node_hdr, anchor="mm")
    draw.text((cx, n5_y0 + 62), "• Cross-references LLM-generated columns with active dataset schema (e.g., maps 'Dept' -> 'Department')", fill="#334155", font=font_node_sub, anchor="mm")
    draw.text((cx, n5_y0 + 90), "• Automatically corrects incompatible chart bindings, resets default axis encodings, and fills missing keys", fill="#475569", font=font_node_sub, anchor="mm")

    # Arrow 5 -> Node 6
    draw_arrow_orthogonal(draw, [(cx, n5_y0 + n5_h), (cx, 1100)], color="#0F172A", width=3, arrow_len=10, arrow_width=6)

    # Node 6: Academic Dataset In-Memory Execution Engine
    n6_w, n6_h = 1260, 120
    n6_x0, n6_y0 = cx - n6_w // 2, 1100
    draw_shadow_rect(draw, (n6_x0, n6_y0, n6_x0 + n6_w, n6_y0 + n6_h), radius=12, fill="#FEFCE8", outline="#CA8A04", width=2)
    draw.rounded_rectangle((n6_x0 + 1, n6_y0 + 1, n6_x0 + n6_w - 1, n6_y0 + 6), radius=3, fill="#EAB308")
    draw.text((cx, n6_y0 + 28), "Academic Dataset Query Execution Engine (backend/services/data_service.py)", fill="#713F12", font=font_node_hdr, anchor="mm")
    draw.text((cx, n6_y0 + 62), "• Filters across 61 Department Spreadsheets (*-CONS-WO.xlsx) using in-memory vectorized Pandas operations", fill="#854D0E", font=font_node_sub, anchor="mm")
    draw.text((cx, n6_y0 + 90), "• Computes dynamic aggregations, cohort percentiles, pass ratios, and prepares JSON table payloads", fill="#713F12", font=font_node_sub, anchor="mm")

    # Arrow 6 -> Node 7
    draw_arrow_orthogonal(draw, [(cx, n6_y0 + n6_h), (cx, 1285)], color="#15803D", width=3, arrow_len=10, arrow_width=6)
    draw_pill(draw, (cx - 160, 1235), "Payload: Aggregated Data Points + Verified Chart Config", font_lbl, "#DCFCE7", "#166534", pad_x=12, pad_y=4, outline="#15803D")

    # Node 7: Frontend Dynamic Visualization & Multi-Export
    n7_w, n7_h = 1380, 140
    n7_x0, n7_y0 = cx - n7_w // 2, 1285
    draw_shadow_rect(draw, (n7_x0, n7_y0, n7_x0 + n7_w, n7_y0 + n7_h), radius=12, fill="#ECFDF5", outline="#10B981", width=2)
    draw.rounded_rectangle((n7_x0 + 1, n7_y0 + 1, n7_x0 + n7_w - 1, n7_y0 + 6), radius=3, fill="#059669")
    draw.text((cx, n7_y0 + 30), "Dynamic Frontend Visualization Studio (React 19 + Recharts Component Suite)", fill="#065F46", font=font_node_hdr, anchor="mm")
    draw.text((cx, n7_y0 + 66), "• Dynamically Mounts Selected Recharts Component (Vertical/Horizontal/Grouped/Stacked Bar, Line, Area, Pie, Radar)", fill="#047857", font=font_node_sub, anchor="mm")
    draw.text((cx, n7_y0 + 96), "• Interactive Sorting, Filtering Data Table  •  One-Click Client-Side Export to PNG, Vector SVG, and Raw CSV", fill="#065F46", font=font_bullet_bold, anchor="mm")

    # Legend at bottom
    foot_y0 = 1500
    draw_rounded_rect(draw, (120, foot_y0, W - 120, foot_y0 + 50), radius=10, fill="#0F172A")
    legend_items = [
        ("#3B82F6", "User Input"),
        ("#F59E0B", "Routing & Parsing"),
        ("#10B981", "Zero-Token Local"),
        ("#A855F7", "Groq Cloud LLM"),
        ("#E11D48", "429 Failover Loop"),
        ("#059669", "Dynamic Recharts Rendering")
    ]
    lx = 160
    for color, text in legend_items:
        draw.rounded_rectangle((lx, foot_y0 + 18, lx + 14, foot_y0 + 32), radius=3, fill=color)
        draw.text((lx + 22, foot_y0 + 15), text, fill="#F8FAFC", font=font_legend)
        lx += font_legend.getbbox(text)[2] - font_legend.getbbox(text)[0] + 45

    os.makedirs("images", exist_ok=True)
    out_path = "images/fig3_2_ai_failover_flowchart.png"
    im.save(out_path, "PNG", dpi=(300, 300))
    print(f"Flawless Figure 3.2 saved to {out_path} ({W}x{H})")

if __name__ == "__main__":
    generate_figure_3_1()
    generate_figure_3_2()
