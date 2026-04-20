import os
import json
import uuid
import pymysql
from datetime import datetime
from flask import (Blueprint, render_template, request,
                   jsonify, current_app)
from werkzeug.utils import secure_filename

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from config import (MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD,
                    MYSQL_DB, MYSQL_PORT, ALLOWED_EXTENSIONS)

web_bp = Blueprint('web', __name__)

# ── DB Helper ─────────────────────────────────────────────────────────────────
def get_db():
    """Return a fresh PyMySQL connection."""
    return pymysql.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        port=MYSQL_PORT,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False
    )

def allowed_file(filename):
    return ('.' in filename and
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS)

# ── Page Routes ───────────────────────────────────────────────────────────────
@web_bp.route('/')
def index():
    return render_template('index.html', active_page='home')

@web_bp.route('/about')
def about():
    return render_template('about.html', active_page='about')

@web_bp.route('/officials')
def officials():
    return render_template('officials.html', active_page='officials')

@web_bp.route('/events')
def events():
    return render_template('events.html', active_page='events')

@web_bp.route('/gallery')
def gallery():
    return render_template('gallery.html', active_page='gallery')

@web_bp.route('/membership')
def membership():
    return render_template('membership.html', active_page='membership')

@web_bp.route('/contact')
def contact():
    return render_template('contact.html', active_page='contact')

@web_bp.route('/news')
def news():
    return render_template('news.html', active_page='news')

@web_bp.route('/mission')
def mission():
    return render_template('mission.html', active_page='about')

@web_bp.route('/presidents')
def presidents():
    return render_template('presidents.html', active_page='officials')

@web_bp.route('/apply-membership')
def apply_membership():
    return render_template('apply_membership.html', active_page='membership')

@web_bp.route('/admin-login')
def admin_login():
    return render_template('admin_login.html', active_page='home')

@web_bp.route('/search-application')
def search_application():
    return render_template('search_application.html', active_page='membership')


# ── Membership Form Submission ────────────────────────────────────────────────
@web_bp.route('/api/submit_membership', methods=['POST'])
def submit_membership():
    """
    Handles final form submission (Step 1 + Step 2).
    - Saves photo to /static/uploads/member_photos/
    - Saves all fields into MySQL membership_applications table
    """
    try:
        f = request.form

        # ── 1. Photo Upload ───────────────────────────────────────────────────
        photo_filename = None
        photo_file = request.files.get('photo')
        if photo_file and photo_file.filename and allowed_file(photo_file.filename):
            ext = photo_file.filename.rsplit('.', 1)[1].lower()
            unique_name = f"{uuid.uuid4().hex}.{ext}"
            save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_name)
            photo_file.save(save_path)
            photo_filename = unique_name

        # ── 2. Parse family members from Step 2 ──────────────────────────────
        family_names   = request.form.getlist('family_name[]')
        family_mobiles = request.form.getlist('family_mobile[]')
        family_members = []
        for i, name in enumerate(family_names):
            family_members.append({
                'name':   name.strip(),
                'mobile': family_mobiles[i].strip() if i < len(family_mobiles) else ''
            })
        family_json = json.dumps(family_members, ensure_ascii=False)

        # ── 3. Safely parse numeric fields ───────────────────────────────────
        def safe_int(val, default=0):
            try: return int(val)
            except: return default

        def safe_decimal(val):
            try: return float(val)
            except: return None

        # ── 4. Parse application date ─────────────────────────────────────────
        app_date_str = f.get('applicationDate', '')
        try:
            app_date = datetime.strptime(app_date_str, '%Y-%m-%d').date()
        except:
            app_date = datetime.today().date()

        # ── 5. Build SQL INSERT ───────────────────────────────────────────────
        sql = """
            INSERT INTO membership_applications (
                application_no, application_date,
                applicant_name, aadhaar_no,
                father_husband_name, mother_name,
                dob, gender, blood_group,
                male_children, female_children, total_children,
                education, occupation,
                mobile, email,
                address, state, district, taluk, pincode,
                payment_ref, classification, payment_amount, specific_project,
                rep_lokasabha, rep_corporation, rep_vidhanasabha,
                rep_cmc, rep_tmc, rep_gram_panchayat,
                introducer_name, introducer_mem_no,
                photo_filename, family_members,
                submission_lang, status
            ) VALUES (
                %(application_no)s, %(application_date)s,
                %(applicant_name)s, %(aadhaar_no)s,
                %(father_husband_name)s, %(mother_name)s,
                %(dob)s, %(gender)s, %(blood_group)s,
                %(male_children)s, %(female_children)s, %(total_children)s,
                %(education)s, %(occupation)s,
                %(mobile)s, %(email)s,
                %(address)s, %(state)s, %(district)s, %(taluk)s, %(pincode)s,
                %(payment_ref)s, %(classification)s, %(payment_amount)s, %(specific_project)s,
                %(rep_lokasabha)s, %(rep_corporation)s, %(rep_vidhanasabha)s,
                %(rep_cmc)s, %(rep_tmc)s, %(rep_gram_panchayat)s,
                %(introducer_name)s, %(introducer_mem_no)s,
                %(photo_filename)s, %(family_members)s,
                %(submission_lang)s, 'submitted'
            )
        """

        params = {
            'application_no':      f.get('applicationNo', '').strip(),
            'application_date':    app_date,
            'applicant_name':      f.get('applicantName', '').strip(),
            'aadhaar_no':          f.get('aadhaarFull', '').strip(),
            'father_husband_name': f.get('fatherHusbandName', '').strip(),
            'mother_name':         f.get('motherName', '').strip(),
            'dob':                 f.get('dob') or None,
            'gender':              f.get('gender', '').strip(),
            'blood_group':         f.get('bloodGroup', '').strip(),
            'male_children':       safe_int(f.get('maleChildren', 0)),
            'female_children':     safe_int(f.get('femaleChildren', 0)),
            'total_children':      safe_int(f.get('totalChildren', 0)),
            'education':           f.get('education', '').strip(),
            'occupation':          f.get('occupation', '').strip(),
            'mobile':              f.get('mobile', '').strip(),
            'email':               f.get('email', '').strip(),
            'address':             f.get('address', '').strip(),
            'state':               f.get('state', '').strip(),
            'district':            f.get('district', '').strip(),
            'taluk':               f.get('taluk', '').strip(),
            'pincode':             f.get('pincode', '').strip(),
            'payment_ref':         f.get('paymentRef', '').strip(),
            'classification':      f.get('classification', '').strip(),
            'payment_amount':      safe_decimal(f.get('paymentAmount')),
            'specific_project':    f.get('specificProject', '').strip(),
            'rep_lokasabha':       f.get('repLokasabha', '').strip(),
            'rep_corporation':     f.get('repCorporation', '').strip(),
            'rep_vidhanasabha':    f.get('repVidhanasabha', '').strip(),
            'rep_cmc':             f.get('repCmc', '').strip(),
            'rep_tmc':             f.get('repTmc', '').strip(),
            'rep_gram_panchayat':  f.get('repGramPanchayat', '').strip(),
            'introducer_name':     f.get('introducerName', '').strip(),
            'introducer_mem_no':   f.get('introducerMemNo', '').strip(),
            'photo_filename':      photo_filename,
            'family_members':      family_json,
            'submission_lang':     f.get('submission_lang', 'kn'),
        }

        # ── 6. Execute & commit ───────────────────────────────────────────────
        conn = get_db()
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                new_id = cursor.lastrowid
            conn.commit()
        finally:
            conn.close()

        return jsonify({
            'status':  'success',
            'message': 'Membership application submitted successfully!',
            'id':      new_id
        })

    except pymysql.MySQLError as db_err:
        return jsonify({'status': 'error', 'message': f'Database error: {str(db_err)}'}), 500
    except Exception as ex:
        return jsonify({'status': 'error', 'message': str(ex)}), 500

# ── Print / PDF View ────────────────────────────────────────────────────────
@web_bp.route('/membership/print/<int:id>')
def print_application(id):
    """
    Fetches details of a submitted application and renders a high-fidelity 
    printable view that mirrors the physical paper form.
    """
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            # Fetch application main data
            cursor.execute("SELECT * FROM membership_applications WHERE id = %s", (id,))
            app = cursor.fetchone()
            
            if not app:
                return "Application not found", 404
            
            # Parse family members JSON if it exists
            if app.get('family_members'):
                try:
                    if isinstance(app['family_members'], str):
                        app['family_members'] = json.loads(app['family_members'])
                    elif isinstance(app['family_members'], list):
                        # Already a list/dict from pymysql JSON support (if enabled)
                        pass
                except:
                    app['family_members'] = []
            else:
                app['family_members'] = []

        return render_template('membership_print.html', app=app)
    except Exception as e:
        return f"Error loading application: {str(e)}", 500
    finally:
        conn.close()

# ── Search Logic ────────────────────────────────────────────────────────────
@web_bp.route('/api/search_membership', methods=['POST'])
def api_search_membership():
    """Search for applications by Aadhaar number."""
    try:
        aadhaar = request.json.get('aadhaar', '').strip()
        if not aadhaar or len(aadhaar) != 12:
            return jsonify({'status': 'error', 'message': 'Invalid Aadhaar number. Please enter 12 digits.'}), 400
        
        conn = get_db()
        try:
            with conn.cursor() as cursor:
                # Query applications (could return multiple if user submitted more than once)
                cursor.execute("""
                    SELECT id, applicant_name, mobile, application_date, status 
                    FROM membership_applications 
                    WHERE aadhaar_no = %s 
                    ORDER BY created_at DESC
                """, (aadhaar,))
                results = cursor.fetchall()
            
            # Format dates for JSON
            for row in results:
                if row['application_date']:
                    row['application_date'] = row['application_date'].strftime('%d-%m-%Y')
            
            return jsonify({
                'status': 'success',
                'count': len(results),
                'applications': results
            })
        finally:
            conn.close()
    except Exception as ex:
        return jsonify({'status': 'error', 'message': str(ex)}), 500

