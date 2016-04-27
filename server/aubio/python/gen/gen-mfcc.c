// WARNING: this file is generated, DO NOT EDIT

// WARNING: if you haven't read the first line yet, please do so
#include "aubiowraphell.h"

typedef struct
{
  PyObject_HEAD
  aubio_mfcc_t * o;
  uint_t buf_size;
  uint_t n_filters;
  uint_t n_coeffs;
  uint_t samplerate;
} Py_mfcc;

static char Py_mfcc_doc[] = "mfcc object";

static PyObject *
Py_mfcc_new (PyTypeObject * pytype, PyObject * args, PyObject * kwds)
{
  Py_mfcc *self;
  uint_t buf_size = 0;
  uint_t n_filters = 0;
  uint_t n_coeffs = 0;
  uint_t samplerate = 0;
  static char *kwlist[] = { "buf_size", "n_filters", "n_coeffs", "samplerate", NULL };

  if (!PyArg_ParseTupleAndKeywords (args, kwds, "|IIII", kwlist,
          &buf_size, &n_filters, &n_coeffs, &samplerate)) {
    return NULL;
  }

  self = (Py_mfcc *) pytype->tp_alloc (pytype, 0);

  if (self == NULL) {
    return NULL;
  }

  self->buf_size = Py_default_vector_length;
  if ((sint_t)buf_size > 0) {
    self->buf_size = buf_size;
  } else if ((sint_t)buf_size < 0) {
    PyErr_SetString (PyExc_ValueError,
        "can not use negative value for buf_size");
    return NULL;
  }

  self->n_filters = 40;
  if ((sint_t)n_filters > 0) {
    self->n_filters = n_filters;
  } else if ((sint_t)n_filters < 0) {
    PyErr_SetString (PyExc_ValueError,
        "can not use negative value for n_filters");
    return NULL;
  }

  self->n_coeffs = 13;
  if ((sint_t)n_coeffs > 0) {
    self->n_coeffs = n_coeffs;
  } else if ((sint_t)n_coeffs < 0) {
    PyErr_SetString (PyExc_ValueError,
        "can not use negative value for n_coeffs");
    return NULL;
  }

  self->samplerate = Py_aubio_default_samplerate;
  if ((sint_t)samplerate > 0) {
    self->samplerate = samplerate;
  } else if ((sint_t)samplerate < 0) {
    PyErr_SetString (PyExc_ValueError,
        "can not use negative value for samplerate");
    return NULL;
  }

  return (PyObject *) self;
}

AUBIO_INIT(mfcc , self->buf_size, self->n_filters, self->n_coeffs, self->samplerate)

AUBIO_DEL(mfcc)

/* function Py_mfcc_do */
static PyObject * 
Py_mfcc_do(Py_mfcc * self, PyObject * args)
{
  /* input vectors python prototypes */
  PyObject * in_obj;

  /* input vectors prototypes */
  cvec_t* in;
  /* output vectors prototypes */
  fvec_t* out;


  if (!PyArg_ParseTuple (args, "O", &in_obj)) {
    return NULL;
  }


  /* input vectors parsing */
  in = PyAubio_ArrayToCCvec (in_obj);

  if (in == NULL) {
    return NULL;
  }

  
  
  /* creating output out as a new_fvec of length self->n_coeffs */
  out = new_fvec (self->n_coeffs);


  /* compute _do function */
  aubio_mfcc_do (self->o, in, out);

  return (PyObject *)PyAubio_CFvecToArray (out);
}

AUBIO_MEMBERS_START(mfcc)
  {"buf_size", T_INT, offsetof (Py_mfcc, buf_size), READONLY, ""},
  {"n_filters", T_INT, offsetof (Py_mfcc, n_filters), READONLY, ""},
  {"n_coeffs", T_INT, offsetof (Py_mfcc, n_coeffs), READONLY, ""},
  {"samplerate", T_INT, offsetof (Py_mfcc, samplerate), READONLY, ""},
AUBIO_MEMBERS_STOP(mfcc)


static PyMethodDef Py_mfcc_methods[] = {
  {NULL} /* sentinel */
};

AUBIO_TYPEOBJECT(mfcc, "aubio.mfcc")
