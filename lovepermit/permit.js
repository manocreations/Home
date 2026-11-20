async function uploadToCloudinary(base64Image) {

    const formData = new FormData();

    formData.append("file", base64Image);
    formData.append("upload_preset", "lovepermit");

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/lsgqmdc9/image/upload",
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();
    if (!response.ok || !data.secure_url) {
        throw new Error(data.error?.message || "Image upload failed. Please retry.");
    }
    return data.secure_url;
}
(function(){
  const root = document;
  const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
  const MAX_SIG_BYTES = 2 * 1024 * 1024;
/* ---------- Photo crop flow ---------- */
  let cropper = null;
  let cropTarget = null;
  const overlay = root.querySelector('#cropOverlay');
  const cropImageEl = root.querySelector('#cropImageEl');
  const cropError = root.querySelector('#cropError');

  function openCropModal(target, dataUrl){
    cropTarget = target;
    cropError.classList.remove('show');
    overlay.classList.add('show');
    cropImageEl.src = dataUrl;
    if (typeof Cropper === 'undefined') {
      cropError.textContent = 'Photo editor could not load. Check your internet connection and try again.';
      cropError.classList.add('show');
      return;
    }
    if(cropper){ cropper.destroy(); cropper = null; }
    setTimeout(function(){
      cropper = new Cropper(cropImageEl, {
        aspectRatio: 1, viewMode: 1, dragMode: 'move', autoCropArea: 1, background: false, responsive: true
      });
    }, 30);
  }
  function closeCropModal(){
    overlay.classList.remove('show');
    if(cropper){ cropper.destroy(); cropper = null; }
    cropTarget = null;
  }
  root.querySelector('#cropCancel').addEventListener('click', closeCropModal);

  function tryExportPhoto(canvas, quality, target){
    canvas.toBlob(function(blob){
      if(!blob){ cropError.classList.add('show'); return; }
      if(blob.size > MAX_PHOTO_BYTES && quality > 0.35){ tryExportPhoto(canvas, quality - 0.1, target); return; }
      if(blob.size > MAX_PHOTO_BYTES){ root.querySelector('#photoError' + target).classList.add('show'); return; }
      root.querySelector('#photoError' + target).classList.remove('show');
      const reader = new FileReader();
      reader.onload = function(e){
        const preview = root.querySelector('#photoPreview' + target);
        const frame = root.querySelector('#frame' + target);
        preview.src = e.target.result;
        preview.style.display = 'block';
        frame.querySelector('svg').style.display = 'none';
        closeCropModal();
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', quality);
  }

  root.querySelector('#cropConfirm').addEventListener('click', function(){
    if(!cropper || !cropTarget) return;
    const canvas = cropper.getCroppedCanvas({ width: 640, height: 640, imageSmoothingQuality: 'high' });
    if(!canvas){ cropError.classList.add('show'); return; }
    tryExportPhoto(canvas, 0.92, cropTarget);
  });

  function bindPhotoInput(inputId){
    const input = root.querySelector('#' + inputId);
    input.addEventListener('change', function(){
      const file = input.files && input.files[0];
      if(!file) return;
      const target = input.getAttribute('data-target');
      if (!file.type.startsWith('image/') || file.size > MAX_PHOTO_BYTES) {
        const error = root.querySelector('#photoError' + target);
        if (error) error.classList.add('show');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e){ openCropModal(target, e.target.result); };
      reader.readAsDataURL(file);
      input.value = '';
    });
  }
  bindPhotoInput('photoA');
  bindPhotoInput('photoB');

  /* ---------- Signature photo upload ---------- */
  function bindSigInput(who){
    const input = root.querySelector('#sigFile' + who);
    const uploadBox = root.querySelector('#sigUpload' + who);
    const preview = root.querySelector('#sigPreview' + who);
    const text = root.querySelector('#sigText' + who);
    const errorMsg = root.querySelector('#sigError' + who);
    const removeBtn = uploadBox.querySelector('.lp-sig-remove');

    input.addEventListener('change', function(){
      const file = input.files && input.files[0];
      if(!file) return;
      errorMsg.classList.remove('show');
      if(file.size > MAX_SIG_BYTES){
        errorMsg.classList.add('show');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e){
        preview.src = e.target.result;
        preview.style.display = 'block';
        text.style.display = 'none';
        uploadBox.querySelector('svg').style.display = 'none';
        uploadBox.classList.add('has-image');
      };
      reader.readAsDataURL(file);
    });

    removeBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      input.value = '';
      preview.src = '';
      preview.style.display = 'none';
      text.style.display = 'block';
      uploadBox.querySelector('svg').style.display = 'block';
      uploadBox.classList.remove('has-image');
      errorMsg.classList.remove('show');
    });
  }
  bindSigInput('Him');
  bindSigInput('Her');

  /* ---------- Emergency mobile: digits only ---------- */
  const emergencyMobileInput = root.querySelector('#emergencyMobile');
  emergencyMobileInput.addEventListener('input', function(){
    emergencyMobileInput.value = emergencyMobileInput.value.replace(/\D/g, '').slice(0, 10);
  });

  /* ---------- Prevent future birth dates ---------- */
  const localToday = new Date();
  const todayStr = [localToday.getFullYear(), String(localToday.getMonth() + 1).padStart(2, "0"), String(localToday.getDate()).padStart(2, "0")].join("-");
  ['dobA', 'dobB'].forEach(function(id){
    root.querySelector('#' + id).max = todayStr;
  });

  /* ---------- Married date toggle ---------- */
  const statusSelect = root.querySelector('#status');
  const marriedField = root.querySelector('.lp-married-date');
  const marriedInput = root.querySelector('#marriedDate');
  statusSelect.addEventListener('change', function(){
    const isMarried = statusSelect.value === 'Married';
    marriedField.style.display = isMarried ? 'block' : 'none';
    marriedInput.required = isMarried;
    if(!isMarried){ marriedField.classList.remove('lp-invalid'); marriedInput.value = ''; }
  });

  root.querySelectorAll('#lpForm input, #lpForm select').forEach(function(el){
    el.addEventListener('input', function(){
      const wrap = el.closest('[data-field]');
      if (wrap && el.checkValidity() && el.value.trim()) wrap.classList.remove('lp-invalid');
    });
  });

  /* ---------- Form submit ---------- */
  const form = root.querySelector('#lpForm');
  const submitBtn = root.querySelector('#lpSubmitBtn');
  const submitError = root.querySelector('#lpSubmitError');

  form.addEventListener('submit', async function(e){
    e.preventDefault();

    let valid = true;
    const baseFields = ['nameA','emailA','dobA','professionA','nameB','emailB','dobB','professionB','issuedDate','status','emergencyMobile','firstILoveYou','firstMeet'];
    const fields = statusSelect.value === 'Married' ? baseFields.concat(['marriedDate']) : baseFields;

    fields.forEach(function(id){
      const el = root.querySelector('#' + id);
      const wrap = root.querySelector('[data-field="' + id + '"]');
      const ok = el.value && el.value.trim() !== '' && el.checkValidity();
      if (wrap) wrap.classList.toggle('lp-invalid', !ok);
      if(!ok) valid = false;
    });
if(!valid){
      const firstInvalid = root.querySelector('.lp-invalid input, .lp-invalid select');
      if(firstInvalid) firstInvalid.focus();
      return;
    }

    const nameA = root.querySelector('#nameA').value.trim();
    const nameB = root.querySelector('#nameB').value.trim();
    const emailA = root.querySelector('#emailA').value.trim();
    const emailB = root.querySelector('#emailB').value.trim();
    const dobA = root.querySelector('#dobA').value;
    const dobB = root.querySelector('#dobB').value;
    const profA = root.querySelector('#professionA').value.trim();
    const profB = root.querySelector('#professionB').value.trim();
    const issuedDate = root.querySelector('#issuedDate').value;
    const status = statusSelect.value;
    const emergency = root.querySelector('#emergencyMobile').value.trim();
    const firstILY = root.querySelector('#firstILoveYou').value;
    const firstMeet = root.querySelector('#firstMeet').value;
    const marriedDate = root.querySelector('#marriedDate').value;
    const photoA = root.querySelector('#photoPreviewA').src;
    const photoB = root.querySelector('#photoPreviewB').src;
    const himSrc = root.querySelector('#sigPreviewHim').src;
    const herSrc = root.querySelector('#sigPreviewHer').src;

    submitError.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    const payload = {
      name_a: nameA,
      email_a: emailA,
      dob_a: dobA,
      profession_a: profA,
      name_b: nameB,
      email_b: emailB,
      dob_b: dobB,
      profession_b: profB,
      issued_date: issuedDate,
      status: status,
      emergency_mobile: emergency,
      first_i_love_you: firstILY,
      first_meet: firstMeet,
      married_date: status === 'Married' ? marriedDate : null
    };

    try {
      // Only send images that were actually uploaded (not the placeholder icon).
    if (photoA && photoA.indexOf("data:") === 0) {
    payload.photo_a = await uploadToCloudinary(photoA);
    }

    if (photoB && photoB.indexOf("data:") === 0) {
    payload.photo_b = await uploadToCloudinary(photoB);
    }
    if (himSrc && himSrc.indexOf('data:') === 0) payload.sig_him = await uploadToCloudinary(himSrc);
    if (herSrc && herSrc.indexOf('data:') === 0) payload.sig_her = await uploadToCloudinary(herSrc);

      const res = await apiFetch('/permits', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
if(!res.ok || !data.success){
        throw new Error(data.message || ('Server responded with ' + res.status));
      }
      if (data.media_warnings && data.media_warnings.length) {
        console.warn('Some images were not saved:', data.media_warnings);
      }
    } catch (err) {
console.error('Failed to save permit:', err);
      submitError.textContent = 'Could not register your permit. ' + err.message;
      submitError.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Review & Register';
      return;
    }

    const formRoot = root.querySelector('#permit-form-root');
    const successSection = root.querySelector('#permit-submit-success');

    if (formRoot) formRoot.hidden = true;
    if (successSection) {
      successSection.hidden = false;
      successSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

  /* ---------- Page init: menu + existing permit guard ---------- */
  getUser();
  initAppMenu();

  (async function checkExistingPermit() {
    try {
      const res = await apiFetch('/permits');
      const data = await res.json();
if (!res.ok || !data.success) return;

      const permits = data.permits || [];
      if (permits.length === 0) return;

      const latest = permits[0];
      if (latest.rejected || String(latest.status).toLowerCase() === "rejected") return;
      const formRoot = root.querySelector('#permit-form-root');

      if (latest.verified) {
if (formRoot) formRoot.hidden = true;
        window.location.href = 'home.html';
        return;
      }

      if (!latest.verified) {
        const alreadySection = root.querySelector('#permit-already-submitted');
if (formRoot) formRoot.hidden = true;
        if (alreadySection) alreadySection.hidden = false;
      }
    } catch (err) {
console.error('Could not check existing permit:', err);
    }
  })();
})();
