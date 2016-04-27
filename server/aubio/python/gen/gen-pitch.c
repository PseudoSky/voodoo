// WARNING: this file is generated, DO NOT EDIT

// WARNING: if you haven't read the first line yet, please do so
#include "aubiowraphell.h"

typedef struct
{
  PyObject_HEAD
  aubio_pitch_t * o;
  char_t* method;
  uint_t buf_size;
  uint_t hop_size;
  uint_t samplerate;
} Py_pitch;

static char Py_pitch_doc[] = "pitch object";

static PyObject *
Py_pitch_new (PyTypeObject * pytype, PyObject * args, PyObject * kwds)
{
  Py_pitch *self;
  char_t* method = NULL;
  uint_t buf_size = 0;
  uint_t hop_size = 0;
  uint_t samplerate = 0;
  static char *kwlist[] = { "method", "buf_size", "hop_size", "samplerate", NULL };

  if (!PyArg_ParseTupleAndKeywords (args, kwds, "|sIII", kwlist,
          &method, &buf_size, &hop_size, &samplerate)) {
    return NULL;
  }

  self = (Py_pitch *) pytype->tp_alloc (pytype, 0);

  if (self == NULL) {
    return NULL;
  }

  self->method = "default";
  if (method != NULL) {
    self->method = method;
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

AUBIO_INIT(pitch , self->method, self->buf_size, self->hop_size, self->samplerate)

AUBIO_DEL(pitch)

/* function Py_pitch_do */
static PyObject * 
Py_pitch_do(Py_pitch * self, PyObject * args)
{
  /* input vectors python prototypes */
  PyObject * in_obj;

  /* input vectors prototypes */
  fvec_t* in;
  /* output vectors prototypes */
  fvec_t* out;


  if (!PyArg_ParseTuple (args, "O", &in_obj)) {
    return NULL;
  }


  /* input vectors parsing */
  in = PyAubio_ArrayToCFvec (in_obj);

  if (in == NULL) {
    return NULL;
  }

  
  
  /* creating output out as a new_fvec of length 1 */
  out = new_fvec (1);


  /* compute _do function */
  aubio_pitch_do (self->o, in, out);

  return (PyObject *)PyAubio_CFvecToArray (out);
}

AUBIO_MEMBERS_START(pitch)
  {"method", T_STRING, offsetof (Py_pitch, method), READONLY, ""},
  {"buf_size", T_INT, offsetof (Py_pitch, buf_size), READONLY, ""},
  {"hop_size", T_INT, offsetof (Py_pitch, hop_size), READONLY, ""},
  {"samplerate", T_INT, offsetof (Py_pitch, samplerate), READONLY, ""},
AUBIO_MEMBERS_STOP(pitch)


static PyObject *
Pyaubio_pitch_set_tolerance (Py_pitch *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t tol;

  if (!PyArg_ParseTuple (args, "f", &tol)) {
    return NULL;
  } 

  err = aubio_pitch_set_tolerance (self->o, tol);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_pitch_set_tolerance");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_pitch_set_unit (Py_pitch *self, PyObject *args)
{
  uint_t err = 0;

  char_t* mode;

  if (!PyArg_ParseTuple (args, "s", &mode)) {
    return NULL;
  } 

  err = aubio_pitch_set_unit (self->o, mode);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_pitch_set_unit");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_pitch_set_silence (Py_pitch *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t silence;

  if (!PyArg_ParseTuple (args, "f", &silence)) {
    return NULL;
  } 

  err = aubio_pitch_set_silence (self->o, silence);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_pitch_set_silence");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_pitch_get_silence (Py_pitch *self, PyObject *unused)
{
  smpl_t tmp = aubio_pitch_get_silence (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_pitch_get_confidence (Py_pitch *self, PyObject *unused)
{
  smpl_t tmp = aubio_pitch_get_confidence (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyMethodDef Py_pitch_methods[] = {
  {"set_tolerance", (PyCFunction) Pyaubio_pitch_set_tolerance,
    METH_VARARGS, ""},
  {"set_unit", (PyCFunction) Pyaubio_pitch_set_unit,
    METH_VARARGS, ""},
  {"set_silence", (PyCFunction) Pyaubio_pitch_set_silence,
    METH_VARARGS, ""},
  {"get_silence", (PyCFunction) Pyaubio_pitch_get_silence,
    METH_NOARGS, ""},
  {"get_confidence", (PyCFunction) Pyaubio_pitch_get_confidence,
    METH_NOARGS, ""},
  {NULL} /* sentinel */
};

AUBIO_TYPEOBJECT(pitch, "aubio.pitch")
