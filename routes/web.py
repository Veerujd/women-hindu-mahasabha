from flask import Blueprint, render_template

web_bp = Blueprint('web', __name__)

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

@web_bp.route('/api/save_draft', methods=['POST'])
def save_draft():
    # Placeholder for saving draft to database
    return {"status": "success", "message": "Draft saved successfully"}

@web_bp.route('/api/submit_membership', methods=['POST'])
def submit_membership():
    # Placeholder for final submission logic
    return {"status": "success", "message": "Membership application submitted successfully"}

@web_bp.route('/admin-login')
def admin_login():
    return render_template('admin_login.html', active_page='home')
