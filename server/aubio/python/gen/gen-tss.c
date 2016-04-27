// WARNING: this file is generated, DO NOT EDIT

// WARNING: if you haven't read the first line yet, please do so
#include "aubiowraphell.h"

typedef struct
{
  PyObject_HEAD
  aubio_tss_t * o;
  uint_t buf_size;
  uint_t hop_size;
} Py_tss;

static char Py_tss_doc[] = "tss object";

static PyObject *
Py_tss_new (PyTypeObject * pytype, PyObject * args, PyObject * kwds)
{
  Py_tss *self;
  uint_t buf_size = 0;
  uint_t hop_size = 0;
  static char *kwlist[] = { "buf_size", "hop_size", NULL };

  if (!PyArg_ParseTupleAndKeywords (args, kwds, "|II", kwlist,
          &buf_size, &hop_size)) {
    return NULL;
  }

  self = (Py_tss *) pytype->tp_alloc (pytype, 0);

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

  self->hop_size = Py_default_vector_length / 2;
  if ((sint_t)hop_size > 0) {
    self->hop_size = hop_size;
  } else if ((sint_t)hop_size < 0) {
    PyErr_SetString (PyExc_ValueError,
        "can not use negative value for hop_size");
    return NULL;
  }

  return (PyObject *) self;
}

AUBIO_INIT(tss , self->buf_size, self->hop_size)

AUBIO_DEL(tss)

/* function Py_tss_do */
static PyObject * 
Py_tss_do(Py_tss * self, PyObject * args)
{
  /* input vectors python prototypes */
  PyObject * input_obj;

  /* input vectors prototypes */
  cvec_t* input;
  /* output vectors prototypes */
  cvec_t* trans;
  cvec_t* stead;


  if (!PyArg_ParseTuple (args, "O", &input_obj)) {
    return NULL;
  }


  /* input vectors parsing */
  input = PyAubio_ArrayToCCvec (input_obj);

  if (input == NULL) {
    return NULL;
  }

  
  
  /* creating output trans as a new_cvec of length self->buf_size */
  trans = new_cvec (self->buf_size);
  /* creating output stead as a new_cvec of length self->buf_size */
  stead = new_cvec (self->buf_size);


  /* compute _do function */
  aubio_tss_do (self->o, input, trans, stead);

  PyObject *outputs = PyList_New(0);
  PyList_Append( outputs, (PyObject *)PyAubio_CCvecToPyCvec (trans));
  PyList_Append( outputs, (PyObject *)PyAubio_CCvecToPyCvec (stead));
  return outputs;;
}

AUBIO_MEMBERS_START(tss)
  {"buf_size", T_INT, offsetof (Py_tss, buf_size), READONLY, ""},
  {"hop_size", T_INT, offsetof (Py_tss, hop_size), READONLY, ""},
AUBIO_MEMBERS_STOP(tss)


static PyObject *
Pyaubio_tss_set_threshold (Py_tss *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t thrs;

  if (!PyArg_ParseTuple (args, "f", &thrs)) {
    return NULL;
  } 

  err = aubio_tss_set_threshold (self->o, thrs);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_tss_set_threshold");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_tss_set_alpha (Py_tss *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t alpha;

  if (!PyArg_ParseTuple (args, "f", &alpha)) {
    return NULL;
  } 

  err = aubio_tss_set_alpha (self->o, alpha);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_tss_set_alpha");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_tss_set_beta (Py_tss *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t beta;

  if (!PyArg_ParseTuple (args, "f", &beta)) {
    return NULL;
  } 

  err = aubio_tss_set_beta (self->o, beta);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_tss_set_beta");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyMethodDef Py_tss_methods[] = {
  {"set_threshold", (PyCFunction) Pyaubio_tss_set_threshold,
    METH_VARARGS, ""},
  {"set_alpha", (PyCFunction) Pyaubio_tss_set_alpha,
    METH_VARARGS, ""},
  {"set_beta", (PyCFunction) Pyaubio_tss_set_beta,
    METH_VARARGS, ""},
  {NULL} /* sentinel */
};

AUBIO_TYPEOBJECT(tss, "aubio.tss")
