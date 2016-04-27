// WARNING: this file is generated, DO NOT EDIT

// WARNING: if you haven't read the first line yet, please do so
#include "aubiowraphell.h"

typedef struct
{
  PyObject_HEAD
  aubio_wavetable_t * o;
  uint_t samplerate;
  uint_t hop_size;
} Py_wavetable;

static char Py_wavetable_doc[] = "wavetable object";

static PyObject *
Py_wavetable_new (PyTypeObject * pytype, PyObject * args, PyObject * kwds)
{
  Py_wavetable *self;
  uint_t samplerate = 0;
  uint_t hop_size = 0;
  static char *kwlist[] = { "samplerate", "hop_size", NULL };

  if (!PyArg_ParseTupleAndKeywords (args, kwds, "|II", kwlist,
          &samplerate, &hop_size)) {
    return NULL;
  }

  self = (Py_wavetable *) pytype->tp_alloc (pytype, 0);

  if (self == NULL) {
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

AUBIO_INIT(wavetable , self->samplerate, self->hop_size)

AUBIO_DEL(wavetable)

/* function Py_wavetable_do */
static PyObject * 
Py_wavetable_do(Py_wavetable * self, PyObject * args)
{
  /* input vectors python prototypes */
  PyObject * input_obj;

  /* input vectors prototypes */
  fvec_t* input;
  /* output vectors prototypes */
  fvec_t* output;


  if (!PyArg_ParseTuple (args, "O", &input_obj)) {
    return NULL;
  }


  /* input vectors parsing */
  input = PyAubio_ArrayToCFvec (input_obj);

  if (input == NULL) {
    return NULL;
  }

  
  
  /* creating output output as a new_fvec of length self->hop_size */
  output = new_fvec (self->hop_size);


  /* compute _do function */
  aubio_wavetable_do (self->o, input, output);

  return (PyObject *)PyAubio_CFvecToArray (output);
}

AUBIO_MEMBERS_START(wavetable)
  {"samplerate", T_INT, offsetof (Py_wavetable, samplerate), READONLY, ""},
  {"hop_size", T_INT, offsetof (Py_wavetable, hop_size), READONLY, ""},
AUBIO_MEMBERS_STOP(wavetable)


static PyObject *
Pyaubio_wavetable_set_playing (Py_wavetable *self, PyObject *args)
{
  uint_t err = 0;

  uint_t playing;

  if (!PyArg_ParseTuple (args, "I", &playing)) {
    return NULL;
  } 

  err = aubio_wavetable_set_playing (self->o, playing);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_wavetable_set_playing");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_wavetable_set_freq (Py_wavetable *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t freq;

  if (!PyArg_ParseTuple (args, "f", &freq)) {
    return NULL;
  } 

  err = aubio_wavetable_set_freq (self->o, freq);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_wavetable_set_freq");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_wavetable_set_amp (Py_wavetable *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t amp;

  if (!PyArg_ParseTuple (args, "f", &amp)) {
    return NULL;
  } 

  err = aubio_wavetable_set_amp (self->o, amp);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_wavetable_set_amp");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_wavetable_get_playing (Py_wavetable *self, PyObject *unused)
{
  uint_t tmp = aubio_wavetable_get_playing (self->o);
  return (PyObject *)PyInt_FromLong (tmp);
}

static PyObject *
Pyaubio_wavetable_get_freq (Py_wavetable *self, PyObject *unused)
{
  smpl_t tmp = aubio_wavetable_get_freq (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_wavetable_get_amp (Py_wavetable *self, PyObject *unused)
{
  smpl_t tmp = aubio_wavetable_get_amp (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyMethodDef Py_wavetable_methods[] = {
  {"set_playing", (PyCFunction) Pyaubio_wavetable_set_playing,
    METH_VARARGS, ""},
  {"set_freq", (PyCFunction) Pyaubio_wavetable_set_freq,
    METH_VARARGS, ""},
  {"set_amp", (PyCFunction) Pyaubio_wavetable_set_amp,
    METH_VARARGS, ""},
  {"get_playing", (PyCFunction) Pyaubio_wavetable_get_playing,
    METH_NOARGS, ""},
  {"get_freq", (PyCFunction) Pyaubio_wavetable_get_freq,
    METH_NOARGS, ""},
  {"get_amp", (PyCFunction) Pyaubio_wavetable_get_amp,
    METH_NOARGS, ""},
  {NULL} /* sentinel */
};

AUBIO_TYPEOBJECT(wavetable, "aubio.wavetable")
