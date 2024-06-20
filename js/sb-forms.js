import { FirebaseManage } from "./firebase.js";

const firebaseManager = new FirebaseManage();

(() => {
  "use strict";
  const t = function (t, e, n, i) {
    return new (n || (n = Promise))(function (s, a) {
      function r(t) {
        try {
          d(i.next(t));
        } catch (t) {
          a(t);
        }
      }
      function o(t) {
        try {
          d(i.throw(t));
        } catch (t) {
          a(t);
        }
      }
      function d(t) {
        var e;
        t.done
          ? s(t.value)
          : ((e = t.value),
            e instanceof n
              ? e
              : new n(function (t) {
                  t(e);
                })).then(r, o);
      }
      d((i = i.apply(t, e || [])).next());
    });
  };
  const e = (t, e = document.body) => {
      const n = [].slice.call(e.querySelectorAll(t));
      if (0 === n.length) throw new Error(`GET_ELEMENTS: ${e.id} -> ${t}`);
      return n;
    },
    n = (t, e = document.body) => {
      const n = e.querySelector(t);
      if (!n) throw new Error(`GET_ELEMENT: ${e.id} -> ${t}`);
      return n;
    };
  var i;
  !(function (t) {
    (t.required = "required"),
      (t.email = "email"),
      (t.length = "length"),
      (t.checked = "checked");
  })(i || (i = {}));
  class s {
    constructor(t, e, n) {
      (this.input = t),
        (this.validations = e),
        (this.onChange = n),
        (this.isPure = !0),
        (this.inputBlurHandler = () => this.inputBlur()),
        (this.inputInputHandler = () => this.inputInput()),
        (this.inputClickHandler = () => this.inputClick()),
        t.addEventListener("blur", this.inputBlurHandler),
        t.addEventListener("input", this.inputInputHandler),
        t.addEventListener("click", this.inputClickHandler);
    }
    inputBlur() {
      (this.isPure = !1), this._handleInputAction();
    }
    inputInput() {
      this._handleInputAction();
    }
    inputClick() {
      this._handleInputAction();
    }
    initValidation() {
      this._handleInputAction();
    }
    _handleInputAction() {
      let t = !0;
      if (
        (this.validations.forEach((e) => {
          t = t && r(this.input, e);
        }),
        a(this.input))
      ) {
        const n = this.input.parentElement.parentElement,
          i = e("input", n);
        if (t) {
          if ((i.forEach((t) => (t.dataset.sbCanSubmit = "yes")), this.isPure))
            return this.onChange(), void (this.isPure = !1);
          n.firstElementChild.classList.remove("is-invalid");
        } else {
          if ((i.forEach((t) => (t.dataset.sbCanSubmit = "no")), this.isPure))
            return this.onChange(), void (this.isPure = !1);
          n.firstElementChild.classList.add("is-invalid");
        }
      } else if (t) {
        if (((this.input.dataset.sbCanSubmit = "yes"), this.isPure))
          return void this.onChange();
        this.input.classList.remove("is-invalid");
      } else {
        if (((this.input.dataset.sbCanSubmit = "no"), this.isPure))
          return void this.onChange();
        this.input.classList.add("is-invalid");
      }
      this.onChange();
    }
    reset() {
      if (((this.isPure = !0), a(this.input))) {
        const t = this.input.parentElement.parentElement,
          n = e("input", t);
        t.firstElementChild.classList.remove("is-invalid"),
          n.forEach((t) => {
            (t.dataset.sbCanSubmit = "no"), (t.checked = !1);
          });
      } else
        (this.input.value = ""),
          this.input.classList.remove("is-invalid"),
          (this.input.dataset.sbCanSubmit = "no");
    }
    tearDown() {
      this.reset(),
        this.input.removeEventListener("blur", this.inputBlurHandler),
        this.input.removeEventListener("input", this.inputInputHandler),
        this.input.removeEventListener("click", this.inputClickHandler);
    }
  }
  const a = (t) => !!["checkbox", "radio"].find((e) => e === t.type),
    r = (t, i) => {
      let s,
        r,
        c = !0;
      if ((a(t) && (r = t.parentElement.parentElement), "object" == typeof i)) {
        if (
          ((c = i.validate()),
          (s = n(`[data-sb-feedback="${t.id}:${i.name}"]`)),
          !s)
        )
          throw new Error(`VALIDATION_NOT_SETUP_FOR: ${t.id}:${i.name}`);
      } else {
        switch (i) {
          case "required":
            a(t)
              ? (c = e("input", r).reduce((t, e) => t || e.checked, !1))
              : t.value || (c = !1);
            break;
          case "email":
            c = o(t.value);
            break;
          case "length":
            c = d(t.value);
            break;
          case "checked":
            c = t.checked;
        }
        if (a(t))
          try {
            s = n(`[data-sb-feedback="${t.name}:${i}"]`);
          } catch (e) {
            throw new Error(`VALIDATION_NOT_SETUP_FOR: ${t.name}:${i}`);
          }
        else
          try {
            s = n(`[data-sb-feedback="${t.id}:${i}"]`);
          } catch (e) {
            throw new Error(`VALIDATION_NOT_SETUP_FOR: ${t.id}:${i}`);
          }
      }
      return c ? s.classList.add("d-none") : s.classList.remove("d-none"), c;
    },
    o = (t) =>
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        String(t).toLowerCase()
      ),
    d = (t) => t.length > 8;
  ((t) => {
    const e = document.createElement("style");
    (e.textContent =
      ".d-none {\n    display: none;\n}\n.invalid-feedback {\n    display: none;\n}\n.btn.disabled {\n    pointer-events: none;\n    opacity: 0.65;\n}"),
      document.head.append(e);
  })(),
    window.addEventListener("DOMContentLoaded", () => {
      e("form[data-sb-form-api-token]").forEach((t) => l(t));
    });
  const c = { initializeForm: (t, e) => l(t, e) };
  window.sbForms = c;
  const l = (r, o) => {
    let d = !0;
    const c = [],
      l = () => {
        w();
      },
      m = n("#submitButton", r),
      f = n("#submitSuccessMessage", r),
      v = n("#submitErrorMessage", r);
    const E = o || e("input, textarea, select", r);
    E.forEach((t) => {
      const e = t.dataset.sbValidations;
      e
        ? ((t.dataset.sbCanSubmit = "no"),
          c.push(
            new s(
              t,
              ((t) => {
                const e = t.split(",").map((t) => t.trim());
                return (
                  e.forEach((t) => {
                    if (!(t in i))
                      throw new Error(`UNRECOGNIZED_VALIDATION_KEY: ${t}`);
                  }),
                  e
                );
              })(e),
              l
            )
          ))
        : (t.dataset.sbCanSubmit = "yes");
    });
    const y = (e) => {
        e.preventDefault();
        const formData = {
          fullName: document.querySelector("#fullName").value,
          email: document.querySelector("#contactEmail").value,
          phone: document.querySelector("#phone").value,
          message: document.querySelector("#message").value,
        };

        // Llamar a la función sendContactUsData para enviar los datos a Firebase
        try {
          firebaseManager.sendContactUsData(formData);
          return (
            m.classList.add("d-none"),
            f.classList.remove("d-none"),
            r.reset(),
            E.forEach((t) => {
              t.setAttribute("disabled", "");
            })
          );
        } catch (error) {
          console.error("Error al enviar datos:", error);
          // Mostrar un mensaje de error si ocurre un error durante el envío de datos
          return v.classList.remove("d-none");
        }
      },
      L = (t) => y(t);
    m.addEventListener("click", L);
    const w = () => {
      E.reduce((t, n) => {
        if (a(n)) {
          const i = n.parentElement.parentElement,
            s = e("input", i);
          return (
            t && s.reduce((t, e) => t || "yes" === e.dataset.sbCanSubmit, !1)
          );
        }
        return "yes" === n.dataset.sbCanSubmit ? t && !0 : t && !1;
      }, !0)
        ? m.classList.remove("disabled")
        : m.classList.add("disabled");
    };
    return (
      c.forEach((t) => t.initValidation()),
      w(),
      {
        tearDown: () => {
          m.removeEventListener("click", L),
            f.classList.add("d-none"),
            v.classList.add("d-none"),
            m.classList.remove("d-none"),
            m.classList.add("disabled"),
            E.forEach((t) => {
              t.removeAttribute("disabled");
            }),
            c.forEach((t) => t.tearDown());
        },
      }
    );
  };
})();
