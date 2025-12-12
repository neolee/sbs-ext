# Image Attributes Fixture

This fixture validates the SBS 1.1 image display attributes.

## Scale + Align

![Woman in red](images/woman-in-red.jpeg){ align=center, scale=0.5 }

## Scale (another float)

![Woman in red](images/woman-in-red.jpeg){ align=left, scale=1.25 }

## Width/Height (scale omitted)

![Woman in red](images/woman-in-red.jpeg){ align=right, width=240, height=160 }

## Width Only

![Woman in red](images/woman-in-red.jpeg){ width=220 }

## Height Only

![Woman in red](images/woman-in-red.jpeg){ height=180 }

## Invalid Values (should be ignored)

![Woman in red](images/woman-in-red.jpeg){ align=banana, scale=0, width=-10, height=abc }