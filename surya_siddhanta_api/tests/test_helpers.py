from app.main import sign_info, nakshatra_info, vimshottari_dasha

def test_sign_wraps_360():
    assert sign_info(360)["name"] == "Mesha"
    assert sign_info(-1)["name"] == "Meena"

def test_nakshatra_pada_range():
    result = nakshatra_info(0)
    assert result["name"] == "Ashwini"
    assert result["pada"] == 1

def test_dasha_returns_lord():
    result = vimshottari_dasha(0)
    assert result["birth_mahadasha_lord"] == "Ketu"
